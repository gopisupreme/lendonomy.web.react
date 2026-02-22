import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function StackedBarChartExample(props) {
  const {labels} = props;
  const options = {
    scales: {
      yAxes: [{gridLines: {display: false}}],
      xAxes: [{gridLines: {display: false}}],
    },
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 0,
      },
    },
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        position: 'right',
        borderWidth: 0,
        display: false,
      },
      title: {
        display: true,
        text: props.title,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: props.IAgeGroupArray,
        borderWidth: 0,
        borderColor: '#fff',
        backgroundColor: props.color,
      },
    ],
  };
  return <Bar width={100} height={80} options={options} data={data} />;
}
