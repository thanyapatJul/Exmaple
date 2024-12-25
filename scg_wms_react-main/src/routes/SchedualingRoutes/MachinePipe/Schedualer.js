import React, { useState, useEffect, useMemo, useRef } from "react";
import Scheduler, { Resource, View } from "devextreme-react/scheduler";
import CustomTooltip from "./CustomTooltip";
import Swal from "sweetalert2";
import CustomAppointment from "./CustomAppointment";
import { LuSunMedium } from "react-icons/lu";
import { BsSunset } from "react-icons/bs";
import { MdOutlineModeNight } from "react-icons/md";
import {
  Box,
  Switch,
  FormControl,
  FormLabel,
  Radio,
  SliderMark,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  RadioGroup,
  Stack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import Axios from "axios";

const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;

const currentDate = new Date();
const shifts = [
  { text: "A", offset: 480, endDayHour: 8 },
  { text: "B", offset: 960, endDayHour: 8 },
  { text: "C", offset: 0, endDayHour: 8 },
  { text: "All", offset: 0, endDayHour: 24 },
];

const filterDataByMachine = (data, selectedMachines) => {
  if (selectedMachines.length === 0 || selectedMachines.includes("empty")) {
    // Return all data if 'all' is selected or no machines are selected
    return [];
  }
  // Return only appointments that match the selected machines
  return data.filter((item) => selectedMachines.includes(item.priorityId));
};

const fetchAppointments = async (machines) => {
  try {
    const response = await client.get("/wms/api/get_appointments", {
      params: { machines: machines },
    });
    if (response.data.success) {
      console.log(response.data.appointments,'response.data.appointments')
      return response.data.appointments.map((appointment) => ({
        id: appointment.planname,
        text: appointment.materialcode,
        stk_frozen: appointment.plancount,
        priorityId: appointment.machine,
        type: appointment.type,
        startDate: new Date(appointment.date_start),
        endDate: new Date(appointment.date_end),
        ownerId: appointment.materialcode,
        ton: appointment.planweight,
        th_name: appointment.materialname,
        planner: appointment.planner,
        versionno: appointment.versionno,
      }));
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const postNewAppointment = async (appointmentData) => {
  const endpoint = "/wms/api/post_machplan";
  try {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const username = `${firstName} ${lastName}`;

    // Add the username to the appointmentData
    appointmentData.username = username;

    const response = await client.post(endpoint, appointmentData);
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error("Error posting new appointment:", error);
    Swal.fire({
      title: "Error!",
      text: error.response?.data?.error,
      icon: "error",
      confirmButtonText: "OK",
    });
    return false;
  }
};

const editAppointment = async (appointmentData) => {
  const endpoint = "/wms/api/edit_appointment";
  try {
    const firstName = localStorage.getItem("first_name");
    const lastName = localStorage.getItem("last_name");
    const username = `${firstName} ${lastName}`;
    appointmentData.username = username;
    const response = await client.post(endpoint, appointmentData);
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error("Error editing appointment:", error);
    return false;
  }
};

const deleteAppointment = async (appointmentId) => {
  const endpoint = "/wms/api/delete_appointment";
  try {
    const response = await client.post(endpoint, { id: appointmentId });
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return false;
  }
};

const ShiftSelector = ({ currentShift, setCurrentShift }) => (
  <RadioGroup
    onChange={(value) =>
      setCurrentShift(shifts.find((shift) => shift.text === value))
    }
    value={currentShift.text} // Bind the value to the currentShift's text
  >
    <Stack direction="row" marginBottom="8px">
      <Radio value="All">All</Radio>
      <Radio value="A">
        <HStack spacing="4px">
          <BsSunset />
          <span>A</span>
        </HStack>
      </Radio>
      <Radio value="B">
        <HStack spacing="4px">
          <MdOutlineModeNight />
          <span>B</span>
        </HStack>
      </Radio>
      <Radio value="C">
        <HStack spacing="4px">
          <LuSunMedium />
          <span>C</span>
        </HStack>
      </Radio>
    </Stack>
  </RadioGroup>
);

const GroupByDateSwitch = ({ groupByDate, onGroupByDateChanged }) => (
  <FormControl display="flex" alignItems="center">
    <FormLabel htmlFor="groupByDateSwitch">Group by Date:</FormLabel>
    <Switch
      id="groupByDateSwitch"
      isChecked={groupByDate}
      onChange={onGroupByDateChanged}
    />
  </FormControl>
);

const ProductionLine = ({
  machines = [],
  onPlanPosted,
  colors = {},
  selectedTab,
}) => {

  const [currentShift, setCurrentShift] = useState(
    shifts.find((shift) => shift.text === "All")
  );
  const [groupByDate, setGroupByDate] = useState(false);
  const [priorityData, setPriorityData] = useState([]);
  const [resourcesData, setResourcesData] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for storing the current view and date
  const [currentView, setCurrentView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());


  useEffect(() => {
    const savedView = localStorage.getItem("schedulerView");
    const savedDate = localStorage.getItem("schedulerDate");

    if (savedView) {
      setCurrentView(savedView);
    }
    if (savedDate) {
      setCurrentDate(new Date(savedDate));
    }
  }, []);

  useEffect(() => {
    if (machines.length > 0) {
      const priorityData = machines.map((machine) => ({
        text: machine,
        id: machine,
      }));
      setPriorityData(priorityData);
    }
  }, [machines]);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const appointments = await fetchAppointments(machines);
        const resourceData = Object.entries(colors).map(([ownerId, color]) => ({
          id: ownerId,
          color: color,
        }));
        setResourcesData(resourceData);
        setData(appointments);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [machines, colors]);

  const filteredPriorityData = useMemo(() => {
    if (selectedTab.length === 0 || selectedTab.includes("all")) {
      // Return all machines if 'all' is selected or no machines are selected
      return [];
    }
    // Return only machines that are in the selectedTab array
    return priorityData.filter((item) => selectedTab.includes(item.id));
  }, [priorityData, selectedTab]);

  const onGroupByDateChanged = (event) => {
    setGroupByDate(event.target.checked);
  };

  const onAppointmentFormOpening = (e) => {
    const appointmentData = e.appointmentData;
    const startDate = new Date(appointmentData.startDate);
    const endDate = new Date(appointmentData.endDate);
  
    // Calculate duration in hours
    const durationInHours = ((endDate - startDate) / (1000 * 60 * 60)).toFixed(2);
  
    e.form.option("items", [
      {
        label: {
          text: "Task",
        },
        editorType: "dxTextBox",
        dataField: "text",
      },
      {
        label: {
          text: "Type",
        },
        dataField: "type",
        editorType: "dxSelectBox",
        editorOptions: {
          items: [
            { id: "MTO", text: "MTO" },
            { id: "Committed", text: "Committed" },
          ],
          displayExpr: "text",
          valueExpr: "id",
        },
      },
      {
        label: {
          text: "Start Date",
        },
        dataField: "startDate",
        editorType: "dxDateBox",
        editorOptions: {
          type: "datetime",
          width: "100%",
        },
      },
      {
        label: {
          text: "End Date",
        },
        dataField: "endDate",
        editorType: "dxDateBox",
        editorOptions: {
          type: "datetime",
          width: "100%",
        },
      },
      {
        label: {
          text: "Duration (hours)",
        },
        dataField: "duration",
        editorType: "dxTextBox",
        editorOptions: {
          value: durationInHours, // Display calculated duration
          readOnly: true, // Make it read-only
        },
      },
    ]);
  };
  

  const onAppointmentAdded = async (e) => {
    const success = await postNewAppointment(e.appointmentData);
    if (success && onPlanPosted) {
      onPlanPosted(); // Notify parent component
    }
  };

  const onAppointmentUpdated = async (e) => {
    const success = await editAppointment(e.appointmentData);
    if (success && onPlanPosted) {
      onPlanPosted(); // Notify parent component
    }
  };

  const onAppointmentDeleted = async (e) => {
    const success = await deleteAppointment(e.appointmentData.id);
    if (success && onPlanPosted) {
      onPlanPosted(); // Notify parent component
    }
  };

  const onViewChange = (viewName) => {
    setCurrentView(viewName);
    // Save the current view to localStorage
    localStorage.setItem("schedulerView", viewName);
  };

  const onDateChange = (newDate) => {
    setCurrentDate(newDate);
    // Save the current date to localStorage
    localStorage.setItem("schedulerDate", newDate);
  };

  const filteredData = useMemo(
    () => filterDataByMachine(data, selectedTab),
    [data, selectedTab, groupByDate]
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const timeSlots = {
    ShiftC: { from: 0, to: 8 }, // 00:00 to 08:00
    ShiftA: { from: 8, to: 16 }, // 08:00 to 16:00
    ShiftB: { from: 16, to: 24 }, // 16:00 to 24:00
  };

  const getTimeSlotClass = (date) => {
    const hours = date.getHours();
    if (hours >= timeSlots.ShiftC.from && hours < timeSlots.ShiftC.to) {
      return "ShiftC";
    } else if (hours >= timeSlots.ShiftA.from && hours < timeSlots.ShiftA.to) {
      return "ShiftA";
    } else if (hours >= timeSlots.ShiftB.from && hours < timeSlots.ShiftB.to) {
      return "ShiftB";
    }
    return null; // No class for other times
  };

  // Helper function to check if the time is within ShiftA hours

  const dataCellTemplate = (itemData, itemIndex, itemElement) => {
    const date = itemData.startDate;
    const element = document.createElement("div");

    const timeSlotClass = getTimeSlotClass(date);
    if (timeSlotClass) {
      element.classList.add(timeSlotClass); // Apply the appropriate class (ShiftC, ShiftA, ShiftB)
    }

    itemElement.append(element);
  };


  // const timeCellTemplate = (itemData, itemIndex, itemElement) => {
  //   const date = itemData.date;
  //   const element = document.createElement("div");
  //   element.textContent = itemData.text; // Add the default time label

  //   // Determine which time slot the cell belongs to and append appropriate text
  //   const timeSlotClass = getTimeSlotClass(date);

  //   if (timeSlotClass === "ShiftC") {
  //     element.textContent += " - ShiftC"; // Add ShiftC text
  //   } else if (timeSlotClass === "ShiftA") {
  //     element.textContent += " - ShiftA"; // Add ShiftA text
  //   } else if (timeSlotClass === "ShiftB") {
  //     element.textContent += " - Night"; // Add Night text
  //   }

  //   // Apply the class for background color
  //   if (timeSlotClass) {
  //     element.classList.add(timeSlotClass);
  //   }

  //   itemElement.append(element);
  // };


  return (
    <div id="scheduler">
      <HStack spacing="24px" marginTop={8}>
        <ShiftSelector
          currentShift={currentShift}
          setCurrentShift={setCurrentShift}
        />
        <GroupByDateSwitch
          groupByDate={groupByDate}
          onGroupByDateChanged={onGroupByDateChanged}
        />

      </HStack>

      <Box minWidth="900px">
        <Scheduler
          timeZone="Indochina Time"
          dataSource={filteredData.length > 0 ? filteredData : []}
          groups={["priorityId"]}
          groupByDate={groupByDate}
          dataCellTemplate={dataCellTemplate} // Highlight grid cells
          showAllDayPanel={false}
          timeCellTemplate={(e) => {
            return new Date(e.date).toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
          currentView={currentView}
          onCurrentViewChange={onViewChange} // Track view changes
          currentDate={currentDate}
          onCurrentDateChange={onDateChange} // Track date changes
          startDayHour={0}
          offset={currentShift.offset}
          endDayHour={currentShift.endDayHour}
          crossScrollingEnabled={true}
          onAppointmentFormOpening={onAppointmentFormOpening}
          onAppointmentAdded={onAppointmentAdded}
          onAppointmentUpdated={onAppointmentUpdated}
          onAppointmentDeleted={onAppointmentDeleted}
          editing={{
            allowAdding: false,
            allowUpdating: false,
            allowDeleting: false,
          }}
          appointmentComponent={(props) => (
            <CustomAppointment
              {...props}
              selectedMachinesCount={selectedTab.length}
            />
          )}
          cellDuration={120}
          // appointmentTooltipComponent={CustomTooltip}
        >
          <Resource
            fieldExpr="ownerId"
            allowMultiple={true}
            dataSource={resourcesData}
            label="Owner"
            useColorAsDefault={true}
          />
          <Resource
            fieldExpr="priorityId"
            allowMultiple={false}
            dataSource={filteredPriorityData}
            label="Machine"
          />
          <View
            type="week"
            name="Week View"
            intervalCount={1} // Scroll by one week at a time
          />
          <View type="day" name="3 Day View" intervalCount={3} />
          <View type="day" name="Day View" intervalCount={1} />
        </Scheduler>
      </Box>
    </div>
  );
};

export default ProductionLine;
