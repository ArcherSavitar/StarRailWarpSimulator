import { Layout } from './components/Layout';
import { BannerSelector } from './components/BannerSelector';
import { PityCounter } from './components/PityCounter';
import { PullButtons } from './components/PullButtons';
import { ResultModal } from './components/ResultModal';
import { StatsPanel } from './components/StatsPanel';

function App() {
  return (
    <Layout>
      <BannerSelector />
      <PityCounter />
      <PullButtons />
      <StatsPanel />
      <ResultModal />
    </Layout>
  );
}

export default App;
