/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {DateLocalTimeCalendar} from "../math/time/calendar";

export default function(){
    return (n: number) => new DateLocalTimeCalendar(n);
}