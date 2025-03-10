import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

const options = {
  plugins: {
    tooltip: {
      mode: "index" as const,
      intersect: false,
      callbacks: {
        label: function (tooltipItem: { raw: number | null; value: number | null }) {
          return numeral(tooltipItem.raw || tooltipItem.value).format("+0,0");
        },
      },
    },
  },
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  scales: {
    xAxes: [{
      type: "time",
      time: {
        parser: "MM/DD/YY",
        tooltipFormat: "ll",
      }
    }],
    yAxes: [{
      gridLines: {
        display: false,
      },
      ticks: {
        callback: function (value: number) {
          return numeral(value).format("0a");
        },
      },
    }],
  },
};

interface CovidData {
  cases: { [key: string]: number };
  deaths: { [key: string]: number };
  recovered: { [key: string]: number };
}

const buildChartData = (data: CovidData, casesType: keyof CovidData) => {
  const chartData: { x: Date; y: number }[] = [];
  let lastDataPoint: number | null = null;
  
  // Check if data exists for the given casesType
  if (!data || !data[casesType]) {
    console.error(`No data found for ${casesType}`);
    return [];
  }
  
  for (const date in data[casesType]) {
    const formattedDate = new Date(date);
    if (lastDataPoint !== null) {
      const newDataPoint = {
        x: formattedDate,
        y: Math.max(0, data[casesType][date] - lastDataPoint), // Ensure positive values
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

interface LineGraphProps {
  casesType?: keyof CovidData;
}

const LineGraph: React.FC<LineGraphProps> = ({ casesType = "cases" }) => {
  const [data, setData] = useState<{ x: Date; y: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://disease.sh/v3/covid-19/historical/all?lastdays=120"
        );
        const data = await response.json();
        console.log("API response:", data); // Debug logging
        const chartData = buildChartData(data, casesType);
        console.log("Chart data:", chartData); // Debug logging
        setData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [casesType]);

  const chartData = {
    datasets: [
      {
        backgroundColor: casesType === "cases" 
          ? "rgba(204, 16, 52, 0.5)" 
          : casesType === "recovered" 
            ? "rgba(125, 215, 29, 0.5)" 
            : "rgba(251, 68, 67, 0.5)",
        borderColor: casesType === "cases" 
          ? "#CC1034" 
          : casesType === "recovered" 
            ? "#7dd71d" 
            : "#fb4443",
        data: data,
        fill: true,
      },
    ],
  };

  return (
    <div style={{ height: "300px" }}>
      {data.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
};

export default LineGraph;