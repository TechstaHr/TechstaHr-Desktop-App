import React from "react";
import CalendarNav from "../CalendarNav";
import TaskCalendar from "../TaskCalendar";

const CalendarComponent = () => {
  return (
    <div className="px-5 py-5 lg:px-8">
      {/* <CalendarNav /> */}

      <TaskCalendar />
    </div>
  );
};

export default CalendarComponent;
