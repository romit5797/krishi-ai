import React, { useState, useEffect } from "react";
import Header from "../partials/Header";
import FilterButton from "../components/DropdownFilter";
import Datepicker from "../components/Datepicker";
import DashboardCard01 from "../partials/dashboard/DashboardCard01";
import DashboardCard02 from "../partials/dashboard/DashboardCard02";
import DashboardCard03 from "../partials/dashboard/DashboardCard03";
import DashboardCard04 from "../partials/dashboard/DashboardCard04";
import DashboardCard05 from "../partials/dashboard/DashboardCard05";
import DashboardCard06 from "../partials/dashboard/DashboardCard06";
import DashboardCard07 from "../partials/dashboard/DashboardCard07";
import DashboardCard08 from "../partials/dashboard/DashboardCard08";
import DashboardCard09 from "../partials/dashboard/DashboardCard09";
import DashboardCard10 from "../partials/dashboard/DashboardCard10";
import DashboardCard11 from "../partials/dashboard/DashboardCard11";
import DashboardCard12 from "../partials/dashboard/DashboardCard12";
import DashboardCard13 from "../partials/dashboard/DashboardCard13";
import Banner from "../partials/Banner";
import analyticsData from "../utils/data.json";
import ThemeToggle from "../components/ThemeToggle";
import MapChart from "../charts/MapChart";
import DashboardCardMap from "../partials/dashboard/DashboardCardMap";
import axios from "axios";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://backend.aisensy.com/krishi-bot/v1/analytics"
        );
        setAnalyticsData(response.data);
        console.log({ analyticsData: response.data });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    // Fetch data immediately, then every 10 seconds
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // 10000 ms = 10 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {analyticsData && (
          <main className="grow">
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div
                  className="mb-4 sm:mb-0"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <img
                    src="https://whatsapp-media-library.s3.ap-south-1.amazonaws.com/IMAGE/6383718694747141e2221ccb/8604907_image%208.png"
                    style={{
                      width: "40px",
                      borderRadius: "8px",
                    }}
                  />
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    Krishi AI
                  </h1>
                </div>

                <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                   Total Messages :-  {analyticsData?.messagesCount}
                  </h1>
                  <ThemeToggle />
                  {/* <FilterButton align="right" />
                <Datepicker align="right" />
                <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                  <svg
                    className="fill-current shrink-0 xs:hidden"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">Add View</span>
                </button> */}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                {/* <DashboardCard02 data={analyticsData} />

                <DashboardCard03 data={analyticsData} /> */}

                <DashboardCard06
                  data={analyticsData.sentimentDistribution}
                  title={"Sentiments"}
                />

                <DashboardCard07
                  data={analyticsData.languageDistribution}
                  title={"Trending Languages"}
                  textColor="text-sky-500"
                  key={1}
                />

                {/* <DashboardCardMap title="Top States Users" /> */}
                <DashboardCard07
                  data={analyticsData.topicDistribution}
                  title="Trending Topics"
                  textColor="text-green-500"
                  key={0}
                />
                <DashboardCard07
                  data={analyticsData.regionDistribution}
                  title={"Top States"}
                  textColor="text-sky-500"
                  key={1}
                />
                {/* <DashboardCard04 data={analyticsData} /> */}

                {/* <DashboardCard05 data={analyticsData} /> */}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
