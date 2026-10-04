'use client';

import { useState } from 'react';

interface InventoryItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends InventoryItem {
  qty: number;
}

interface SaleRecord {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  tax: number;
}

export default function ShiltonPOS() {
  const [user, setUser] = useState<{ username: string; role: 'admin' | 'cashier' } | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('pos');

  // Categories State
  const [categories, setCategories] = useState<string[]>(['Main', 'Beverage', 'Short Eats']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: 'Chicken Meal (චිකන්)', price: 380, stock: 50, category: 'Main' },
    { id: 2, name: 'Fish Meal (මාළු)', price: 300, stock: 40, category: 'Main' },
    { id: 3, name: 'Egg Meal (බිත්තර)', price: 300, stock: 60, category: 'Main' },
    { id: 4, name: 'Ice Coffee (අයිස් කෝපි)', price: 200, stock: 100, category: 'Beverage' },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Main');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === 'admin123') {
      setUser({ username: 'Admin', role: 'admin' });
    } else if (usernameInput === 'cashier' && passwordInput === 'cash123') {
      setUser({ username: 'Cashier', role: 'cashier' });
    } else {
      alert('වැරදි යූසර් නේම් හෝ පාස්වර්ඩ් එකක්!');
    }
  };

  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      alert('මෙම භාණ්ඩයේ ස්ටොක් නොමැත!');
      return;
    }
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(cart.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const updatedInventory = inventory.map((invItem) => {
      const cartItem = cart.find((c) => c.id === invItem.id);
      if (cartItem) {
        return { ...invItem, stock: invItem.stock - cartItem.qty };
      }
      return invItem;
    });
    setInventory(updatedInventory);

    const newSale: SaleRecord = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: [...cart],
      total: totalAmount,
      tax: totalAmount * 0.025,
    };
    setSalesHistory([newSale, ...salesHistory]);
    setCart([]);
    alert('බිල්පත සාර්ථකව සකස් විය!');
  };

  const handleAddInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const newItem: InventoryItem = {
      id: Date.now(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      stock: parseInt(newItemStock) || 0,
      category: newItemCategory,
    };
    setInventory([...inventory, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemStock('');
    alert('අයිතමය සාර්ථකව එකතු කරන ලදී!');
  };

  // Add Category (Admin Only)
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName || categories.includes(newCategoryName)) return;
    setCategories([...categories, newCategoryName]);
    setNewCategoryName('');
    alert('නව කැටගිරිය එකතු කරන ලදී!');
  };

  // Remove Category (Admin Only)
  const handleRemoveCategory = (catToRemove: string) => {
    if (confirm(`ඔබට '${catToRemove}' කැටගිරිය මකා දැමීමට අවශ්‍යද?`)) {
      setCategories(categories.filter((c) => c !== catToRemove));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-xl w-96 border border-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-center text-orange-500">Shilton Family Restaurant</h2>
          <p className="text-sm text-gray-400 text-center mb-6">POS & Inventory System</p>
          <div className="mb-4">
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 p-2 rounded font-bold transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  const filteredInventory = selectedCategory === 'All' 
    ? inventory 
    : inventory.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-orange-500">Shilton Family Restaurant</h1>
          <p className="text-xs text-gray-400">Logged in as: <span className="text-green-400">{user.username} ({user.role})</span></p>
        </div>
        <nav className="flex gap-2">
          <button onClick={() => setActiveTab('pos')} className={`px-4 py-2 rounded ${activeTab === 'pos' ? 'bg-orange-600' : 'bg-gray-700'}`}>POS / Billing</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded ${activeTab === 'inventory' ? 'bg-orange-600' : 'bg-gray-700'}`}>Inventory / Stock</button>
          {user.role === 'admin' && (
            <>
              <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-orange-600' : 'bg-gray-700'}`}>Admin Manage</button>
              <button onClick={() => setActiveTab('ird')} className={`px-4 py-2 rounded ${activeTab === 'ird' ? 'bg-orange-600' : 'bg-gray-700'}`}>IRD Reports</button>
            </>
          )}
          <button onClick={() => setUser(null)} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700">Logout</button>
        </nav>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Category Filter Bar */}
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Categories</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${selectedCategory === 'All' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    All Items
                  </button>
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredInventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-orange-500 text-left flex flex-col justify-between transition shadow-md"
                  >
                    <div>
                      <span className="text-xs bg-gray-700 text-orange-400 px-2 py-0.5 rounded">{item.category}</span>
                      <h3 className="font-bold text-lg mt-2">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">Stock: {item.stock}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-orange-400 font-bold">LKR {item.price}.00</span>
                      <span className="bg-green-600 text-xs px-2 py-1 rounded font-bold">+ ADD</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Bill Panel */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col justify-between shadow-md">
              <div>
                <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Current Bill</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-10">No items selected yet.</p>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-gray-700/50 p-2 rounded">
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                        </div>
                        <span className="font-bold text-orange-300">LKR {item.price * item.qty}.00</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total:</span>
                  <span className="text-green-400">
                    LKR {cart.reduce((sum, i) => sum + i.price * i.qty, 0)}.00
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-bold transition shadow-lg"
                >
                  Complete & Print Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Inventory & Stock Status</h2>
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Available Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-t border-gray-700">
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3">LKR {item.price}.00</td>
                      <td className="p-3 font-bold text-orange-400">{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'manage' && user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Add New Item */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-orange-400">Add New Menu Item</h2>
              <form onSubmit={handleAddInventoryItem} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 p-2 rounded font-bold">
                  Add Item
                </button>
              </form>
            </div>

            {/* Manage Categories */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-orange-400">Manage Categories</h2>
              <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-1">New Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                    placeholder="Enter category..."
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold">
                  Add Category
                </button>
              </form>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">Existing Categories:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded">
                      <span>{cat}</span>
                      <button
                        onClick={() => handleRemoveCategory(cat)}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ird' && user.role === 'admin' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">දේශීය ආදායම් දෙපාර්තමේන්තු වාර්තා (IRD Tax Reports)</h2>
            <p className="text-sm text-gray-400 mb-6">ආරම්භක දිනයේ සිට මෙතෙක් සිදුවූ සියලුම ගනුදෙනු සහ බදු වාර්තා ස්වයංක්‍රීයව සටහන් වේ.</p>
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total Sales Count: {salesHistory.length} Transactions</span>
                <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded text-sm font-bold">Print Report</button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300 text-sm">
                    <th className="p-2">Transaction ID</th>
                    <th className="p-2">Date & Time</th>
                    <th className="p-2">Total Amount</th>
                    <th className="p-2">Estimated Tax (VAT/SSCL)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesHistory.map((sale) => (
                    <tr key={sale.id} className="border-t border-gray-700 text-sm">
                      <td className="p-2">#{sale.id}</td>
                      <td className="p-2">{sale.date}</td>
                      <td className="p-2 text-green-400 font-bold">LKR {sale.total}.00</td>
                      <td className="p-2 text-orange-400">LKR {sale.tax.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}