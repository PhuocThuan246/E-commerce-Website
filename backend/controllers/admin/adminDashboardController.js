const Order = require("../../models/Order");
const User = require("../../models/User");

exports.simpleDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.countDocuments({
      role: "user",
      createdAt: { $gte: sevenDaysAgo }
    });

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, revenue: { $sum: "$total" } } }
    ]);

    const revenue = totalRevenueAgg[0]?.revenue || 0;

    const bestProducts = await Order.aggregate([
    { $unwind: "$items" },

    {
        $group: {
        _id: "$items.product",
        totalSold: { $sum: "$items.quantity" }
        }
    },

    { $sort: { totalSold: -1 } },
    { $limit: 5 },

    // JOIN với collection products
    {
        $lookup: {
        from: "products",            // tên collection trong MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "product"
        }
    },

    { $unwind: "$product" },

    // Chỉ lấy những field cần thiết
    {
        $project: {
        _id: 1,
        totalSold: 1,
        name: "$product.name",
        image: "$product.image",
        price: "$product.effectivePrice"
        }
    }
    ]);


    res.json({
      totalUsers,
      newUsers,
      totalOrders,
      revenue,
      bestProducts
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
};


exports.advancedDashboard = async (req, res) => {
  try {
    const { type = "year", start, end } = req.query;

    let dateFilter = {};
    if (type === "range" && start && end) {
      dateFilter = {
        createdAt: {
          $gte: new Date(start),
          $lte: new Date(end)
        }
      };
    }

    let groupId = {};

    switch (type) {
      case "week":
        groupId = {
          year: { $isoWeekYear: "$createdAt" },
          week: { $isoWeek: "$createdAt" }
        };
        // CHỈ LẤY TUẦN CỦA NĂM HIỆN TẠI
        dateFilter = {
          ...dateFilter,
          createdAt: {
            ...(dateFilter.createdAt || {}),
            $gte: new Date(new Date().getFullYear(), 0, 1)
          }
        };
        break;


      case "month":
        groupId = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        break;

      case "quarter":
        groupId = {
          year: { $year: "$createdAt" },
          quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } }
        };
        break;

      default:
        groupId = {
          year: { $year: "$createdAt" }
        };
    }

    const stats = await Order.aggregate([
      { $match: { status: "delivered", ...dateFilter } },
      {
        $group: {
          _id: groupId,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },

          // Lợi nhuận = 30% doanh thu
          profit: { $sum: { $multiply: ["$total", 0.3] } },

          totalProducts: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              }
            }
          }
        }
      },
      { $sort: {
      "_id.year": 1,
      "_id.quarter": 1,
      "_id.month": 1,
      "_id.week": 1
      } }
    ]);



    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Advanced dashboard error" });
  }
};

