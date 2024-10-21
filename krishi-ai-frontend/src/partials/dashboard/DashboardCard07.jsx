import React from "react";

function DashboardCard07(props) {
  return (
    <div className="col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          {props.title}
        </h2>
      </header>
      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-sm">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Topic</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Interactions</div>
                </th>
              </tr>
            </thead>

            <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
              {Object.keys(props.data).map((value) => {
                return (
                  <tr>
                    <td className="p-2">
                      <div className="flex items-center">
                        <div className="text-gray-800 dark:text-gray-100">
                          {value.split("_").join(" ")}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className={`text-center ${props.textColor}`}>
                        {props.data[value]}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard07;
