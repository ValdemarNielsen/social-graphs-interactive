import { Component, type ReactNode } from 'react';

/** Keep the reading available if an old open tab requests a replaced build asset. */
export default class ExperimentBoundary extends Component<{children:ReactNode;fallback?:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?(this.props.fallback??<div className="lab-loading" role="status"><p>The experiment could not load. Your study notes are still available below.</p><button className="button secondary" onClick={()=>location.reload()}>Reload this chapter ↻</button></div>):this.props.children}
}
