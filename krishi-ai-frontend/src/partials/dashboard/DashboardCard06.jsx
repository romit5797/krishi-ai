import React from "react";
import DoughnutChart from "../../charts/DoughnutChart";

const dataColor = {
  POSITIVE: "#4CAF50", // Medium-dark green
  NEUTRAL: "#9E9E9E", // Medium-dark gray
  NEGATIVE: "#E57373", // Medium-dark red
  MIXED: "#FFB74D", // Medium-dark orange
  ANGER: "#D32F2F", // Medium-dark crimson
  SURPRISE: "#FF9800", // Medium-dark orange
  FEAR: "#3F51B5", // Medium-dark blue
  JOY: "#FBC02D", // Medium-dark yellow
  SADNESS: "#546E7A", // Medium-dark blue-gray
  DISGUST: "#8E24AA", // Medium-dark purple
  CONFUSION: "#7E57C2",
};

// Function to map values to percentage
const mapToPercentage = (values) => {
  let percentages = {};
  Object.keys(values).forEach((key) => {
    percentages[key] = (
      (values[key] /
        Object.values(values).reduce((sum, value) => sum + value, 0)) *
      100
    ).toFixed(2); // Round to 2 decimal places
  });
  return percentages;
};

function DashboardCard06(props) {
  const chartData = {
    labels: Object.keys(props.data),
    datasets: [
      {
        label: "Sentiments",
        data: Object.values(mapToPercentage(props.data)),
        backgroundColor: Object.keys(props.data).map(
          (value) => dataColor[value]
        ),
        hoverBackgroundColor: Object.keys(props.data).map(
          (value) => dataColor[value]
        ),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {props.title}
        </h2>
      </header>

      <DoughnutChart data={chartData} width={389} height={260} />
    </div>
  );
}

export default DashboardCard06;
