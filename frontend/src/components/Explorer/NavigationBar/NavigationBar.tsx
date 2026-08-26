import { getExplorerContext } from '../../../contexts/ExplorerContext';
import './NavigationBar.css'
import { MdArrowBack, MdRefresh, MdOutlineHome } from "react-icons/md";
import { BsFolder2, BsChevronRight } from "react-icons/bs";

function NavigationBar() {
    const { paths, removePath, trimPath, fetchData } = getExplorerContext(); 

    return (
        <>
            <div className='navigation-container'>
                <div className='navigation-button' onClick={() => removePath()}>
                    <MdArrowBack size={30} />
                    <span>Go back</span>
                </div>
                <div className='navigation-button' onClick={() => {trimPath(null)}}>
                    <MdOutlineHome size={30} />
                    <span>Home</span>
                </div>
                <div className='navigation-button' onClick={() => fetchData()}>
                    <MdRefresh size={30} />
                    <span>Refresh</span>
                </div>
                <div className='navigation-path-container'>
                    <ul>
                    {paths.map((path, index, arr) => {
                        const isLast = index === arr.length - 1;
                        
                        return (
                            <li key={path.id} className='navigation-path-item' onClick={() => {trimPath(path.id)}}>
                                <BsFolder2 />{path.name}
                                {!isLast && <BsChevronRight/>}
                            </li>
                        )
                    })}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default NavigationBar