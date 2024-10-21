import React from "react";
import DoughnutChart from "../../charts/DoughnutChart";

// Import utilities
import { tailwindConfig } from "../../utils/Utils";
import MapChart from "../../charts/MapChart";

// Values for each category
const data = {
  POSITIVE: 8,
  MIXED: 3,
  NEUTRAL: 2,
  CONFUSION: 1,
};

// Calculate the total sum of the values
const total = Object.values(data).reduce((sum, value) => sum + value, 0);

// Function to map values to percentage
const mapToPercentage = (values, total) => {
  let percentages = {};
  Object.keys(values).forEach((key) => {
    percentages[key] = ((values[key] / total) * 100).toFixed(2); // Round to 2 decimal places
  });
  return percentages;
};

// Distribute values over 100
const percentageDistribution = mapToPercentage(data, total);

function DashboardCardMap(props) {
  const chartData = {
    labels: ["POSITIVE", "MIXED", "NEUTRAL", "CONFUSION"],
    datasets: [
      {
        label: "Sentiments",
        data: Object.values(percentageDistribution),
        backgroundColor: ["#42b860", "#eaca17", "#758694", "#e63a3a"],
        hoverBackgroundColor: ["#42b860", "#eaca17", "#758694", "#e63a3a"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div
      className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {props.title}
        </h2>
      </header>
      <MapChart />
    </div>
  );
}

export default DashboardCardMap;
