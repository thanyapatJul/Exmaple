import React from 'react'
import { useState,useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

import './index.css'

const BarChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const data = [
      { year: 2010, count: 10 },
      { year: 2011, count: 20 },
      { year: 2012, count: 15 },
      { year: 2013, count: 25 },
      { year: 2014, count: 22 },
      { year: 2015, count: 30 },
      { year: 2016, count: 28 },
    ];

    if (chartRef.current) {
        let chartStatus = Chart.getChart("acquisitions");
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut', // Change the chart type to doughnut
        data: {
          labels: data.map(row => row.year),
          datasets: [
            {
              label: 'Acquisitions by year',
              data: data.map(row => row.count),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(64, 64, 64, 0.6)',
              ],
            }
          ]
        }
        });
    }
  }, []); // Empty dependency array ensures the effect runs once after initial render

  return (  <div style={{height: '400px', width: '400px'}}>
                <canvas ref={chartRef} id="acquisitions"></canvas>
                {/* <div class="col-12 col-md-6">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="mb-1">Total orders<span class="badge badge-phoenix badge-phoenix-warning rounded-pill fs--1 ms-2"><span class="badge-label">-6.8%</span></span></h5>
                                    <h6 class="text-700">Last 7 days</h6>
                                </div>
                                <h4>16,247</h4>
                            </div>
                            <div class="d-flex justify-content-center px-4 py-6">
                            <div className="echart-total-orders" style={{height: '85px', width: '115px', userSelect: 'none', WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)', position: 'relative'}} _echarts_instance_="ec_1691382987390">
                                <canvas ref={chartRef} id="acquisitions"></canvas>

                            </div>
                            <div class="mt-2">
                            <div class="d-flex align-items-center mb-2">
                                <div class="bullet-item bg-primary me-2"></div>
                                <h6 class="text-900 fw-semi-bold flex-1 mb-0">Completed</h6>
                                <h6 class="text-900 fw-semi-bold mb-0">52%</h6>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="bullet-item bg-primary-100 me-2"></div>
                                <h6 class="text-900 fw-semi-bold flex-1 mb-0">Pending payment</h6>
                                <h6 class="text-900 fw-semi-bold mb-0">48%</h6>
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>);
};

export default BarChart;