import React from "react";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <p className="text-xl font-bold">120</p>
          <p>Total Users</p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <p className="text-xl font-bold">80</p>
          <p>Total Books</p>
        </div>
        <div className="bg-white shadow-md p-6 rounded-lg text-center">
          <p className="text-xl font-bold">30</p>
          <p>Issued Books</p>
        </div>
      </div>
    </div>
  );
}
