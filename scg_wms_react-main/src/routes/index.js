import Navbar from '../components/Navbar';
import SidebarWithHeader from '../components/Sidebar';
import BarChart from '../components/Chart';

import BasicStatistics from '../components/Stat';
import BlockContent from '../components/BlockContent';
import BlockCard from '../components/Card';

const Index = () => {
    return (
        <div>
            <SidebarWithHeader>
                <BasicStatistics />
                <BlockCard />
                {/* <BlockContent /> */}
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
                <BasicStatistics />
            </SidebarWithHeader>
        </div>
    );
};

export default Index;
