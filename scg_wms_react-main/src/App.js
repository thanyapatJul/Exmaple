import {
  Link as ReactRouterLink,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { BsDatabaseDown } from "react-icons/bs";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import "devextreme/dist/css/dx.light.css";
import { Navigate } from "react-router-dom";
import { Box, Link as ChakraLink, LinkProps } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, theme, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { MdEngineering } from "react-icons/md";
import { FaArrowTrendUp } from "react-icons/fa6";
import { LuGauge } from "react-icons/lu";
// System Page
import UnauthorizedPage from "./routes/SystemRoutes/UnauthorizedPage/UnauthorizedPage";
import NotFoundPage from "./routes/SystemRoutes/NotFoundPage/NotFoundPage";
import LoginPage from "./routes/SystemRoutes/LoginPage/LoginPage";
import RegisterPage from "./routes/PlannerRoutes/RegisterPage/RegisterPage";
import RPA from "./routes/PlannerRoutes/RPA";
import Movement1 from "./routes/PlannerRoutes/Movement1";
import Job2 from "./routes/PlannerRoutes/Job2";

import SelectMCPage from "./routes/LabRoutes/LockLabsPage/SelectMCLockLab";

import SelectMCLockLab from "./routes/LabRoutes/LockLabsPage/SelectMCLockLab";
import SelectBoardWood from "./routes/LabRoutes/LockLabsPage/SelectBoardWood";
import FormBoardHS from "./routes/LabRoutes/LockLabsPage/FormBoardHS";
import FormWoodHS from "./routes/LabRoutes/LockLabsPage/FormWoodHS";

// Planner Page
// import FillPlanApprovePage from './routes/FillPlanApprovePage/FillPlanApprovePage';
import DashboardPage from "./routes/PlannerRoutes/DashboardPage/DashboardPage";

import AdminPage from "./routes/PlannerRoutes/AdminPage/AdminPage";
import AddProductPage from "./routes/PlannerRoutes/AddProductPage/AddProductPage";

import Teach from "./routes/PlannerRoutes/AddProductPage/Tutor";

// Planner Page - Admin
import AdminHomePage from "./routes/AdminHomePage/AdminHomePage";

// Page Component
import SidebarWithHeader from "./components/Sidebar";
import Navbar from "./components/Navbar";
import BoxLoader from "./components/BoxLoader";

import "./App.css";
import themeex from "./theme";

import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiGrid,
  FiFileText,
  FiMap,
  FiTruck,
  FiUserCheck,
  FiInbox,
  FiShoppingCart,
  FiArchive,
} from "react-icons/fi";
import { FaRegCalendarMinus } from "react-icons/fa";
import { GoReport } from "react-icons/go";
import { AiOutlineStock } from "react-icons/ai";

import { BsFillGridFill } from "react-icons/bs";
import { GiTigerHead } from "react-icons/gi";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { useRecoilState } from "recoil";
import { MachineSelector } from "./Store";
import { MdFactory } from "react-icons/md";

import React, { useEffect, useState, Suspense } from "react";

import { VStack, Flex, Heading } from "@chakra-ui/react";

import Axios from "axios";
const client = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true,
});
client.defaults.xsrfCookieName = "csrftoken";
client.defaults.xsrfHeaderName = "X-CSRFToken";
client.defaults.withXSRFToken = true;
client.defaults.withCredentials = true;

const DashboardOverviewPage = React.lazy(() =>
  import("./routes/SchedualingRoutes/CheckWIP/DashboardOverviewPage")
);
const MarketingPage = React.lazy(() =>
  import("./routes/SchedualingRoutes/Marketing/MarketingPage")
);
const StockNotify = React.lazy(() =>
  import("./routes/SchedualingRoutes/StockNoti/MainPage")
);

function PrivateRoute({ element }) {
  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState(false);

  const checkSession = async () => {
    try {
      const response = await client.get("wms/api/check_session");
      if (!response.data.success) {
        window.location.href = "/login";
      } else {
        localStorage.setItem("first_name", response.data.data.first_name);
        localStorage.setItem("last_name", response.data.data.last_name);
        localStorage.setItem("employee_id", response.data.data.employee_id);
        localStorage.setItem("role_id", response.data.data.role_id);
        localStorage.setItem("role_name", response.data.data.role_name);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setSessionChecked(true);
    }
  };

  useEffect(() => {
    checkSession();
  }, [location]);

  // รอให้เช็คเซสชั่นเสร็จสิ้นก่อนที่จะแสดง element
  if (!sessionChecked) {
    return (
      <Flex
        height="100vh" // กำหนดความสูงของ Flex container
        justifyContent="center" // จัดกลางแนวนอน
        alignItems="center" // จัดกลางแนวตั้ง
      >
        <VStack>
          <BoxLoader />
          <Heading fontSize={"xl"}>{/* Bifröst Loading... */}</Heading>
        </VStack>
      </Flex>
    );
  }

  return element;
}
const MainpagePVP = React.lazy(() =>
  import("./routes/SchedualingRoutes/UploadPlan/MainpagePVP")
);

const Performance = React.lazy(() =>
  import("./routes/SchedualingRoutes/Perfromance/ProductSerie")
);

const OperatorPerformance = React.lazy(() =>
  import("./routes/SchedualingRoutes/Perfromance/Operator")
);

const MachinePerformance = React.lazy(() =>
  import("./routes/SchedualingRoutes/Perfromance/Machine_Pefromance")
);

const MachinePerformance_timeserie = React.lazy(() =>
  import("./routes/SchedualingRoutes/Perfromance/MachinePerfTS")
);

const ProtectedRoute = ({ element, requiredRoles }) => {
  const userRole = localStorage.getItem("role_id");

  if (requiredRoles.includes(userRole) || userRole === "1") {
    return element;
  } else {
    return <UnauthorizedPage />;
  }
};

function App() {
  return (
    <ChakraProvider theme={themeex}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/*"
            element={<PrivateRoute element={<CollectRoutes />} />}
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

const CheckRoleRoute = () => {
  const userRole = localStorage.getItem("role_id");

  if (userRole === "1") {
    return <Navigate to="/admin" replace />;
  } else if (userRole === "2") {
    return <Navigate to="/planner" replace />;
  } else if (userRole === "3") {
    return <Navigate to="/planner" replace />;
  } else if (userRole === "5") {
    return <Navigate to="/Lab" replace />;
  } else if (userRole === "4") {
    return <Navigate to="/PlantCo" replace />;
  } else if (userRole === "7") {
    return <Navigate to="/pis" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default App;

function CollectRoutes() {
  return (
    <>
      <Box bgColor={useColorModeValue("#ffff", "gray.800")} minHeight="100vh">
        <Routes>
          <Route path="/" element={<CheckRoleRoute />} />
          <Route
            path="/Lab/*"
            element={
              <ProtectedRoute element={<LabRoutes />} requiredRoles={["5"]} />
            }
          />
          <Route
            path="/planner/*"
            element={
              <ProtectedRoute
                element={<PlannerRoutes />}
                requiredRoles={["2", "3", "4"]}
              />
            }
          />

          <Route
            path="/PlantCo/*"
            element={
              <ProtectedRoute
                element={<PlantCoRoutes />}
                requiredRoles={["4"]}
              />
            }
          />

          <Route
            path="/SCM/*"
            element={
              <ProtectedRoute element={<SCMRoutes />} requiredRoles={["6"]} />
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute element={<AdminRoutes />} requiredRoles={["1"]} />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </>
  );
}

function LabRoutes() {
  const [list_navlink, setNavLinks] = useState([
    { name: "Lab", link_to: "/lab/", icon: FiHome },
    {
      name: "Reports",
      icon: FiUserCheck,
      list_menu: [
        { name: "Send Report", link_to: "/lab/Reports", icon: GoReport },
      ],
    },
  ]);
  const [listmc, setListmc] = useState([
    "HS3",
    "HS4",
    "HS5",
    "HS6",
    "HS7",
    "HS8",
    "HS9",
    "CT1",
    "CT2",
    "CT3",
    "CT4",
    "XY1",
    "CM5",
    "CM6",
    "CM7",
    "CM8",
    "AS1",
    "PK1",
    "PK2",
    "PK3",
    "PK4",
    "PK5",
    "PK6",
    "DET",
    "MS1",
    "OC1",
    "OC2",
    "DP1",
    "DP2",
    "OS1",
    "PL1",
    "RT1",
    "RT2",
    "SD1",
    "SEG",
  ]);
  return (
    <>
      <SidebarWithHeader linkItems={list_navlink}>
        <Routes>
          <Route path="/" element={<SelectMCLockLab />} />
          {listmc
            .filter((mc_element) => mc_element.includes("HS"))
            .map((mc_element) => (
              <React.Fragment key={mc_element}>
                <Route
                  path={`/${mc_element}`}
                  element={<SelectBoardWood machineSelect={mc_element} />}
                />

                <Route
                  path={`/${mc_element}/board`}
                  element={<FormBoardHS machineSelect={mc_element} />}
                />

                <Route
                  path={`/${mc_element}/wood`}
                  element={<FormWoodHS machineSelect={mc_element} />}
                />
              </React.Fragment>
            ))}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SidebarWithHeader>
    </>
  );
}

function AdminRoutes() {
  const [list_navlink, setNavLinks] = useState([
    { name: "planner", link_to: "/admin", icon: FiHome },
    {
      name: "Approve",
      icon: FiUserCheck,
      list_menu: [
        { name: "Reports", link_to: "/admin/Reports", icon: GoReport },
      ],
    },
    {
      name: "Scheduling",
      icon: FiMap,
      list_menu: [
        {
          name: "Planning",
          link_to: "/admin/dashboard_warehouse",
          icon: FaRegCalendarMinus,
        },
        {
          name: "Marketing",
          link_to: "/admin/Marketing",
          icon: AiOutlineStock,
        },
        {
          name: "Stock Notiy",
          link_to: "/admin/StockNotify",
          icon: BsDatabaseDown,
        },
        {
          name: "Plan vs Production",
          link_to: "/admin/PlanVProduct",
          icon: BsFileEarmarkBarGraph,
        },
      ],
    },

    {
      name: "Performance",
      icon: LuGauge,
      list_menu: [
        {
          name: "Machine Performance",
          link_to: "/admin/MachinePerformance",
          icon: MdFactory,
        },
        {
          name: "Machine time series",
          link_to: "/admin/MachinePerformance_timeserie",
          icon: MdFactory,
        },
        {
          name: "Production Trend",
          link_to: "/admin/ProductionTrend",
          icon: FaArrowTrendUp,
        },

        {
          name: "Operator Performance",
          link_to: "/admin/OperatorPerformance",
          icon: MdEngineering,
        },
      ],
    },

    {
      name: "Admin",
      icon: FiArchive,
      list_menu: [
        { name: "User", link_to: "/admin/admin", icon: FaUser },
        {
          name: "Material",
          link_to: "/admin/addproduct",
          icon: BsFillGridFill,
        },
      ],
    },

    {
      name: "Teaching material",
      icon: FiArchive,
      list_menu: [
        {
          name: "Material_Forteach",
          link_to: "/admin/teach",
          icon: BsFillGridFill,
        },
      ],
    },

    {
      name: "Day1",
      icon: FiArchive,
      list_menu: [
        {
          name: "Material_Forteach",
          link_to: "/admin/teach",
          icon: BsFillGridFill,
        },
      ],
    },
  ]);

  return (
    <Suspense
      fallback={
        <Flex height="100vh" justifyContent="center" alignItems="center">
          <VStack>
            <BoxLoader />
          </VStack>
        </Flex>
      }
    >
      <Routes>
        <Route
          path="/*"
          element={
            <SidebarWithHeader linkItems={list_navlink}>
              <Routes>
                <Route path="/" element={<MainpagePVP />} />
                <Route
                  path="/dashboard_warehouse"
                  element={<DashboardOverviewPage />}
                />
                <Route path="/Marketing" element={<MarketingPage />} />
                <Route path="/StockNotify" element={<StockNotify />} />
                <Route path="/PlanVProduct" element={<MainpagePVP />} />
                <Route path="/ProductionTrend" element={<Performance />} />
                <Route
                  path="/MachinePerformance"
                  element={<MachinePerformance />}
                />
                <Route
                  path="/OperatorPerformance"
                  element={<OperatorPerformance />}
                />
                <Route
                  path="/MachinePerformance_timeserie"
                  element={<MachinePerformance_timeserie />}
                />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/addproduct" element={<AddProductPage />} />
                <Route path="/teach" element={<Teach />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarWithHeader>
          }
        />
      </Routes>
    </Suspense>
  );
}

function PlannerRoutes() {
  const [listmc, setListmc] = useState([
    "HS3",
    "HS4",
    "HS5",
    "HS6",
    "HS7",
    "HS8",
    "HS9",
    "CT1",
    "CT2",
    "CT3",
    "CT4",
    "XY1",
    "CM5",
    "CM6",
    "CM7",
    "CM8",
    "AS1",
    "PK1",
    "PK2",
    "PK3",
    "PK4",
    "PK5",
    "PK6",
    "DET",
    "MS1",
    "OC1",
    "OC2",
    "DP1",
    "DP2",
    "OS1",
    "PL1",
    "RT1",
    "RT2",
    "SD1",
    "SEG",
  ]);
  const [list_navlink, setNavLinks] = useState([
    { name: "planner", link_to: "/planner", icon: FiHome },
    {
      name: "Approve",
      icon: FiUserCheck,
      list_menu: [
        { name: "Reports", link_to: "/planner/Reports", icon: GoReport },
      ],
    },
    {
      name: "Scheduling",
      icon: FiMap,
      list_menu: [
        {
          name: "Planning",
          link_to: "/planner/dashboard_warehouse",
          icon: FaRegCalendarMinus,
        },
        // {
        //   name: "Marketing",
        //   link_to: "/planner/Marketing",
        //   icon: AiOutlineStock,
        // },
        {
          name: "Stock Notiy",
          link_to: "/planner/StockNotify",
          icon: BsDatabaseDown,
        },
        {
          name: "Plan vs Production",
          link_to: "/planner/PlanVProduct",
          icon: BsFileEarmarkBarGraph,
        },
      ],
    },
    {
      name: "Performance",
      icon: LuGauge,
      list_menu: [
        {
          name: "Machine Performance",
          link_to: "/planner/MachinePerformance",
          icon: MdFactory,
        },
        {
          name: "Machine time series",
          link_to: "/planner/MachinePerformance_timeserie",
          icon: MdFactory,
        },
        {
          name: "Production Trend",
          link_to: "/planner/ProductionTrend",
          icon: FaArrowTrendUp,
        },

        {
          name: "Operator Performance",
          link_to: "/planner/OperatorPerformance",
          icon: MdEngineering,
        },
      ],
    },
  ]);

  return (
    <Suspense
      fallback={
        <Flex height="100vh" justifyContent="center" alignItems="center">
          <VStack>
            <BoxLoader />
          </VStack>
        </Flex>
      }
    >
      <Routes>
        <Route
          path="/*"
          element={
            <SidebarWithHeader linkItems={list_navlink}>
              <Routes>
                <Route path="/" element={<MainpagePVP />} />
                <Route
                  path="/dashboard_warehouse"
                  element={<DashboardOverviewPage />}
                />
                <Route path="/Marketing" element={<MarketingPage />} />
                <Route path="/StockNotify" element={<StockNotify />} />
                <Route path="/PlanVProduct" element={<MainpagePVP />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route path="/ProductionTrend" element={<Performance />} />
                <Route
                  path="/MachinePerformance"
                  element={<MachinePerformance />}
                />
                <Route
                  path="/MachinePerformance_timeserie"
                  element={<MachinePerformance_timeserie />}
                />

                <Route
                  path="/OperatorPerformance"
                  element={<OperatorPerformance />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarWithHeader>
          }
        />
      </Routes>
    </Suspense>
  );
}

function PlantCoRoutes() {
  const [list_navlink, setNavLinks] = useState([
    { name: "PlantCo", link_to: "/PlantCo", icon: FiHome },
    {
      name: "Approve",
      icon: FiUserCheck,
      list_menu: [
        { name: "Reports", link_to: "/PlantCo/Reports", icon: GoReport },
      ],
    },
    {
      name: "Scheduling",
      icon: FiMap,
      list_menu: [
        {
          name: "Planning",
          link_to: "/PlantCo/dashboard_warehouse",
          icon: FaRegCalendarMinus,
        },
        {
          name: "Stock Notiy",
          link_to: "/PlantCo/StockNotify",
          icon: BsDatabaseDown,
        },
        {
          name: "Plan vs Production",
          link_to: "/PlantCo/PlanVProduct",
          icon: BsFileEarmarkBarGraph,
        },
      ],
    },
    {
      name: "Performance",
      icon: LuGauge,
      list_menu: [
        {
          name: "Machine Performance",
          link_to: "/PlantCo/MachinePerformance",
          icon: MdFactory,
        },
        {
          name: "Machine time series",
          link_to: "/PlantCo/MachinePerformance_timeserie",
          icon: MdFactory,
        },
        {
          name: "Production Trend",
          link_to: "/PlantCo/ProductionTrend",
          icon: FaArrowTrendUp,
        },

        {
          name: "Operator Performance",
          link_to: "/PlantCo/OperatorPerformance",
          icon: MdEngineering,
        },
      ],
    },
  ]);

  return (
    <Suspense
      fallback={
        <Flex height="100vh" justifyContent="center" alignItems="center">
          <VStack>
            <BoxLoader />
          </VStack>
        </Flex>
      }
    >
      <Routes>
        <Route
          path="/*"
          element={
            <SidebarWithHeader linkItems={list_navlink}>
              <Routes>
                <Route path="/" element={<MainpagePVP />} />
                <Route
                  path="/dashboard_warehouse"
                  element={<DashboardOverviewPage />}
                />
                <Route path="/Marketing" element={<MarketingPage />} />
                <Route path="/StockNotify" element={<StockNotify />} />
                <Route path="/PlanVProduct" element={<MainpagePVP />} />
                <Route path="/admin" element={<AdminPage />} />

                <Route path="/ProductionTrend" element={<Performance />} />
                <Route
                  path="/MachinePerformance"
                  element={<MachinePerformance />}
                />
                <Route
                  path="/MachinePerformance_timeserie"
                  element={<MachinePerformance_timeserie />}
                />

                <Route
                  path="/OperatorPerformance"
                  element={<OperatorPerformance />}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarWithHeader>
          }
        />
      </Routes>
    </Suspense>
  );
}

function SCMRoutes() {
  const [list_navlink, setNavLinks] = useState([
    { name: "planner", link_to: "/SCM", icon: FiHome },
    {
      name: "Approve",
      icon: FiUserCheck,
      list_menu: [{ name: "Reports", link_to: "/SCM/Reports", icon: GoReport }],
    },
    {
      name: "Scheduling",
      icon: FiMap,
      list_menu: [
        {
          name: "Planning",
          link_to: "/SCM/dashboard_warehouse",
          icon: FaRegCalendarMinus,
        },
        {
          name: "Stock Notiy",
          link_to: "/SCM/StockNotify",
          icon: BsDatabaseDown,
        },
        {
          name: "Plan vs Production",
          link_to: "/SCM/PlanVProduct",
          icon: BsFileEarmarkBarGraph,
        },
      ],
    },
    {
      name: "Admin",
      icon: FiArchive,
      list_menu: [
        {
          name: "Material",
          link_to: "/SCM/addproduct",
          icon: BsFillGridFill,
        },
      ],
    },
  ]);

  return (
    <Suspense
      fallback={
        <Flex height="100vh" justifyContent="center" alignItems="center">
          <VStack>
            <BoxLoader />
          </VStack>
        </Flex>
      }
    >
      <Routes>
        <Route
          path="/*"
          element={
            <SidebarWithHeader linkItems={list_navlink}>
              <Routes>
                <Route path="/" element={<MainpagePVP />} />
                <Route
                  path="/dashboard_warehouse"
                  element={<DashboardOverviewPage />}
                />
                <Route path="/Marketing" element={<MarketingPage />} />
                <Route path="/StockNotify" element={<StockNotify />} />
                <Route path="/PlanVProduct" element={<MainpagePVP />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/addproduct" element={<AddProductPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SidebarWithHeader>
          }
        />
      </Routes>
    </Suspense>
  );
}
