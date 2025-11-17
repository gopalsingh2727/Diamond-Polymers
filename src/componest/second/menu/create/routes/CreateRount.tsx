import { Routes, Route } from "react-router-dom";
import CreateNewAccount from "../createNewAccount/createNewAccount";
import CreateMaterials from "../Materials/createMaterials";
import CreteMachineOpertor from "../CreateMachineOpertor/CreteMachineOpertor";
import CreateStep from "../CreateStep/CreateStep";
import ProductCreate from "../products/products";
import IndexCreate from "../indexCreate";
import CreateMachine from "../machine/CreateMachine";
import CreateMachineType from "../machine/createMachineType";
import CreateOrder from "../orders/CreateOrder";
import CreateOrderType from "../orderType/CreateOrderType";

function IndexCreateRoute() {
  return (
    <Routes>
      <Route path="/" element={<IndexCreate />} />
      <Route path="cratenewAccount" element={<CreateNewAccount />} />
      <Route path="Createmachine" element={<CreateMachine />} />
      <Route path="CreateMaterials" element={<CreateMaterials />} />
      <Route path="createMachineOpertor" element={<CreteMachineOpertor />} />
      <Route path="createStep" element={<CreateStep />} />
      <Route path="productCreate" element={<ProductCreate />} />
      <Route path="createMachineType"  element = {<CreateMachineType/>}/>
      <Route path="orders" element={<CreateOrder />} />
      <Route path="orderType" element={<CreateOrderType />} />

    </Routes>
  );
}

export default IndexCreateRoute;