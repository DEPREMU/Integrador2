import { LayoutProvider } from "@/context/LayoutContext";
import AppNavigator from "@/navigation/AppNavigator";

const App = () => 
<LayoutProvider>
    <AppNavigator />;
</LayoutProvider>


export default App;
