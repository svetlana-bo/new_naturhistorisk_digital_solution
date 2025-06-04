import './App.css'
import { RouterProvider , createBrowserRouter} from 'react-router-dom';
import Layout from './views/Layout.jsx';
import DefaultPage from './views/DefaultPage';
import Interaction1 from './views/Interaction1.jsx';
import Interaction2 from './views/Interaction2.jsx';
import Interaction3 from './views/Interaction3.jsx';
import Interaction4 from './views/Interaction4.jsx';
import Interaction5 from './views/Interaction5.jsx';
import Interaction6 from './views/Interaction.jsx';
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
        path: "interaction1",
        element: <Interaction1 />,
      },
      {
        path: "interaction2",
        element: <Interaction2 />,
      },
      {
        path: "interaction3",
        element: <Interaction3 />,
      },
      {
        path: "interaction4",
        element: <Interaction4 />,
      },
      {
        path: "interaction5",
        element: <Interaction5 />,
      },

      {
        path: "interaction6",
        element: <Interaction6 />,
      },
  
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
],
{basename: '/new_naturhistorisk_digital_solution'});


function App() {
  

  return (
  <RouterProvider router={router} />
  )
}

export default App
