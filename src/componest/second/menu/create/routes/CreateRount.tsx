import { Routes, Route } from "react-router-dom";
import CreateNewAccount from "../createNewAccount/createNewAccount";
import CreteMachineOpertor from "../CreateMachineOpertor/CreteMachineOpertor";
import CreateStep from "../CreateStep/CreateStep";
import IndexCreate from "../indexCreate";
import CreateMachine from "../machine/CreateMachine";
import CreateMachineType from "../machine/createMachineType";
import CreateOrder from "../orders/CreateOrder";
import CreateOrderType from "../orderType/CreateOrderType";
import CreateOptionType from "../optionType/CreateOptionType";
import CreateOption from "../option/CreateOption";
import CreateOptionSpec from "../optionSpec/CreateOptionSpec";
import CreateInventory from "../inventory/CreateInventory";

function IndexCreateRoute() {
  return (
    <Routes>
      <Route path="/" element={<IndexCreate />} />
      <Route path="cratenewAccount" element={<CreateNewAccount />} />
      <Route path="Createmachine" element={<CreateMachine />} />
      <Route path="createMachineOpertor" element={<CreteMachineOpertor />} />
      <Route path="createStep" element={<CreateStep />} />
      <Route path="createMachineType"  element = {<CreateMachineType/>}/>
      <Route path="orders" element={<CreateOrder />} />
      <Route path="orderType" element={<CreateOrderType />} />
      <Route path="optionType" element={<CreateOptionType />} />
      <Route path="optionSpec" element={<CreateOptionSpec />} />
      <Route path="option" element={<CreateOption />} />
      <Route path="inventory" element={<CreateInventory />} />

    </Routes>
  );
}

export default IndexCreateRoute;