import { Routes, Route } from "react-router-dom";
import IndexCreateRoute from '../../second/menu/create/routes/CreateRount'
import Menu from "./menu";
import DayBook  from "../../second/menu/Daybook/Daybook";
import OrderForm from "../../second/menu/CreateOders/CreateOders";
import Adderss  from "../../second/menu/AdderssPrint/AddersPrint";
import IndexAllOders from "../../second/menu/Oders/indexAllOders";
import IndexEdit from "../../second/menu/Edit/EditRount/indexEdit";
import SystemSetting from "../../second/menu/SystemSetting/SystemSetting";
import Dispatch from "../../second/menu/Dispatch/Dispatch";
import Marketing from "../../second/menu/marketing/Marketing";
import Account from "../../second/menu/Account/Account";
import AccountInfo from "../../second/menu/Account/AccountInfo/AccountInfo";




function IndexMenuRoute() {
  return (
    <Routes>
      <Route path="/" element={<Menu />} /> {/* /menu */}
      <Route path="indexcreateroute/*" element={<IndexCreateRoute />} /> 
      <Route path="daybook" element={<DayBook/>} />
      <Route path ="orderform" element={<OrderForm/>} />
      <Route path ="adderss" element={<Adderss/>} />
      <Route path="IndexAllOders"  element={<IndexAllOders />} />
      <Route path="edit"  element = {<IndexEdit/>}/>
      <Route path="SystemSetting" element ={<SystemSetting/>} />
      <Route path="dispatch" element={<Dispatch/>}/>
      <Route path="marketing" element={<Marketing/>} />
      <Route path="Account" element={<Account/>} />
      <Route path="AccountInfo" element = {<AccountInfo/>}/>
      

       

     
   
    </Routes>
  );
}

export default IndexMenuRoute;