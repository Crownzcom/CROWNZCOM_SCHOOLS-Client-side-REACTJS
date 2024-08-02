import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import useNetworkStatus from "./hooks/useNetworkStatus";
import Home from "./components/Home/Home.js";
import PaymentResult from "./components/subscription/subscriber/PaymentVerification.js";
import MobileMoney from "./components/subscription/subscriber/MobileMoney.js";
import CardPayment from "./components/subscription/subscriber/CardPayment.js";
// import Receipt from "./components/subscription/subscriber/Receipt.js";
import AddPackageForm from "./components/subscription/management/AddPackageForm .js"
import SelectPackage from './components/subscription/subscriber/SelectPackage.js';
import Testing from './components/Testing.js'
import { showToast } from "./utilities/toastUtil.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css';

function App() {

  const isOnline = useNetworkStatus();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    if (!isOnline) {
      showToast("You are offline. Check your internet connection.", "warning");
    } else {
      showToast("You are back online.", "success");
    }
  }, [isOnline]);

  return (
    <Router>
      <div className="App">
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/subscribe" element={<SelectPackage />} />
            <Route path="/payment/verification" element={<PaymentResult />} />
            <Route path="/payment/mobile-money" element={<MobileMoney />} />
            <Route path="/payment/card-payment" element={<CardPayment />} />
            <Route path="/mgt/subscribe/add-package" element={<AddPackageForm />} />
            <Route path="/testing" element={<Testing />} />
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </Router>
  );
}

export default App;
