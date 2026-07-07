import Backdrop from './components/Backdrop'
import Menubar from './components/Menubar'
import Hero from './components/Hero'
import Bench from './components/Bench'
import Ops from './components/Ops'
import Pipeline from './components/Pipeline'
import Ports from './components/Ports'
import Footer from './components/Footer'
import StatusBar from './components/StatusBar'

export default function App() {
  return (
    <div id="top" className="darkroom pb-8">
      <Backdrop />
      <Menubar />
      <main>
        <Hero />
        <Bench />
        <Ops />
        <Pipeline />
        <Ports />
      </main>
      <Footer />
      <StatusBar />
    </div>
  )
}
