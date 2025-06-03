import './App.css'
import { HashRouter, RouterProvider , createBrowserRouter} from 'react-router-dom';
import Layout from './views/Layout.jsx';
import DefaultPage from './views/DefaultPage';
import Interaction from './views/Interaction.jsx';
import NotFound from './views/NotFound.jsx';

const router = createBrowserRouter([

  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DefaultPage />,
      },
      {
        path: "interaction",
        element: <Interaction />,
      },
  
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
],
{basename: '/naturhistorisk_digital_solution'});


function App() {
  

  return (
  <RouterProvider router={router} />
  )
}

export default App
