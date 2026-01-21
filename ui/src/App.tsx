import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DataInput } from './pages/DataInput';
import { Benchmarks } from './pages/Benchmarks';
import { Scenarios } from './pages/Scenarios';
import { Report } from './pages/Report';
import { Help } from './pages/Help';
import type { OrganizationData, TabId } from './lib/types';
import { generateAnalysisReport } from './lib/calculator';
import { sampleData } from './data/sampleData';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [data, setData] = useState<OrganizationData>(sampleData);

  // Generate report whenever data changes
  const report = useMemo(() => generateAnalysisReport(data), [data]);

  const handleNavigate = (tab: TabId) => {
    setActiveTab(tab);
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleNavigate}>
      {activeTab === 'dashboard' && (
        <Dashboard report={report} onNavigate={handleNavigate} />
      )}
      {activeTab === 'data' && (
        <DataInput data={data} onDataChange={setData} />
      )}
      {activeTab === 'benchmarks' && (
        <Benchmarks report={report} />
      )}
      {activeTab === 'scenarios' && (
        <Scenarios report={report} />
      )}
      {activeTab === 'report' && (
        <Report report={report} />
      )}
      {activeTab === 'help' && (
        <Help />
      )}
    </Layout>
  );
}

export default App;
