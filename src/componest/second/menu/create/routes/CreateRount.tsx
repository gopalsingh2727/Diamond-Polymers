import { Routes, Route } from "react-router-dom";
import CreateNewAccount from "../createNewAccount/createNewAccount";
import CreateMaterials from "../Materials/createMaterials";
import CreteMachineOpertor from "../CreateMachineOpertor/CreteMachineOpertor";
import CreateStep from "../CreateStep/CreateStep";
import ProductCreate from "../products/products";
import IndexCreate from "../indexCreate";
import CreateMachine from "../machine/CreateMachine"; 
import CreateMachineType from "../machine/createMachineType";

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
      
    </Routes>
  );
}

export default IndexCreateRoute;