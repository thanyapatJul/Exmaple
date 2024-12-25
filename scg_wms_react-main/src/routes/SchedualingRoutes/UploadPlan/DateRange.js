import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  addMonths 
} from 'date-fns';
import Axios from 'axios';

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});

const DateRangeSelect = ({ dateRange, onDateChange }) => {
  const [customRange, setCustomRange] = useState({ lastWeek: [null, null], thisWeek: [null, null] });

  const fetchDate = async () => {
    try {
      const response = await client.get('wms/api/get_date');
      const { lastWeekStart, lastWeekEnd, thisWeekStart, thisWeekEnd } = response.data;
      setCustomRange({
        lastWeek: [new Date(lastWeekStart), new Date(lastWeekEnd)],
        thisWeek: [new Date(thisWeekStart), new Date(thisWeekEnd)],
      });
    } catch (error) {
      console.error('Error fetching date range:', error);
    }
  };

  useEffect(() => {
    fetchDate();
  }, []);

  const predefinedRanges = [
    {
      label: 'Last week',
      value: customRange.lastWeek,
      appearance: 'default'
    },
    {
      label: 'This week',
      value: customRange.thisWeek,
      appearance: 'default'
    },
    {
      label: 'This month s',
      value: [startOfMonth(new Date()), new Date()],
      appearance: 'default'
    },
    {
      label: 'Last month',
      value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
      appearance: 'default'
    },
  ];

  return (
    <DateRangePicker
      placeholder="Select date range"
      value={dateRange}
      onChange={onDateChange}
      format="dd-MM-yyyy"
      size="xl"

      ranges={predefinedRanges}
      style={{ zIndex: 1 }}
    />
  );
};

export default DateRangeSelect;
