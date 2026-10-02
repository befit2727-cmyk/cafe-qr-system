import React, { useMemo } from "react";
import { useCafe } from "../../context/CafeContext";
import { DollarSign, TrendingUp, ShoppingBag, Users, Award, Coffee } from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { orders, config, menu } = useCafe();

  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrdersCount = validOrders.length;
    const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // Calculate top-selling items
    const itemSalesCount: Record<string, { name: string; count: number; revenue: number }> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemSalesCount[item.menuItemId]) {
          itemSalesCount[item.menuItemId] = { name: item.name, count: 0, revenue: 0 };
        }
        itemSalesCount[item.menuItemId].count += item.quantity;
        itemSalesCount[item.menuItemId].revenue += item.unitPrice * item.quantity;
      });
    });

    const topItems = Object.values(itemSalesCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const menuItem = menu.find((m) => m.id === item.menuItemId);
        const cat = menuItem?.category || "Other";
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.unitPrice * item.quantity;
      });
    });

    return {
      totalRevenue,
      totalOrdersCount,
      avgOrderValue,
      topItems,
      categoryRevenue
    };
  }, [orders, menu]);

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Gross Sales</p>
            <h3 className="text-2xl font-black text-stone-900 mt-0.5">
              {config.currencySymbol}{metrics.totalRevenue.toFixed(2)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Live from table orders
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Total Table Orders</p>
            <h3 className="text-2xl font-black text-stone-900 mt-0.5">
              {metrics.totalOrdersCount}
            </h3>
            <span className="text-[11px] text-stone-500">Across {config.tables.length} tables</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Average Ticket</p>
            <h3 className="text-2xl font-black text-stone-900 mt-0.5">
              {config.currencySymbol}{metrics.avgOrderValue.toFixed(2)}
            </h3>
            <span className="text-[11px] text-stone-500">Per table check</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">Active Menu Items</p>
            <h3 className="text-2xl font-black text-stone-900 mt-0.5">
              {menu.filter((m) => m.inStock).length} / {menu.length}
            </h3>
            <span className="text-[11px] text-stone-500">In-stock & ready</span>
          </div>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                Best Selling Dishes & Drinks
              </h4>
              <p className="text-xs text-stone-500">Ranked by volume ordered from QR</p>
            </div>
          </div>

          {metrics.topItems.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">No orders processed yet</p>
          ) : (
            <div className="space-y-3">
              {metrics.topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? "bg-amber-500 text-white" : "bg-stone-200 text-stone-700"
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</h5>
                      <span className="text-[11px] text-stone-500">{item.count} orders placed</span>
                    </div>
                  </div>

                  <span className="font-bold text-stone-900 text-xs sm:text-sm">
                    {config.currencySymbol}{item.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Revenue Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-stone-900 text-base">Revenue by Category</h4>
            <p className="text-xs text-stone-500">Sales performance across food & beverage groups</p>
          </div>

          <div className="space-y-3">
            {Object.entries(metrics.categoryRevenue).map(([cat, rev]) => {
              const pct = metrics.totalRevenue > 0 ? (rev / metrics.totalRevenue) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-800">
                    <span>{cat}</span>
                    <span>{config.currencySymbol}{rev.toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
