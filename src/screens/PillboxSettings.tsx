import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useLanguage } from "@context/LanguageContext";
import { useUserContext } from "@context/UserContext";
import HeaderComponent from "@components/common/Header";

interface SettingsProps {}

const PillboxSettings: React.FC<SettingsProps> = () => {
  const { isLoggedIn } = useUserContext();
  const { translations } = useLanguage();




  return (
    <>
      <HeaderComponent />
    </>
  );
};

export default PillboxSettings;
