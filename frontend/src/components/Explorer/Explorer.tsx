import './Explorer.css'
import NavigationBar from './NavigationBar/NavigationBar'
import ToolBar from './ToolBar/ToolBar'
import ListView from './ListView/ListView'

function Explorer() {
    return (
        <>
            <h2>Super Fast file upload</h2>
            <NavigationBar />
            <ToolBar />
            <ListView />
        </>
    )
}

export default Explorer