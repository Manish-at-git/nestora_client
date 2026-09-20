import React from "react";
import { DatePicker, DatePickerProps } from "./date-picker";

export interface MonthPickerProps extends Omit<DatePickerProps, "mode"> {}

export const MonthPicker: React.FC<MonthPickerProps> = (props) => {
  return <DatePicker mode="month" placeholder="Select month..." {...props} />;
};

MonthPicker.displayName = "MonthPicker";
export default MonthPicker;
