interface Week {
  name: string;
  value: string;
  checked: boolean;
}
const weekListTemplate = [
  { name: 'All', value: 'all', checked: false },
  { name: 'Week1', value: '1', checked: false },
  { name: 'Week2', value: '2', checked: false },
  { name: 'Week3', value: '3', checked: false },
  { name: 'Week4', value: '4', checked: false },
  { name: 'Week5', value: '5', checked: false }
];
export const initialWeekDay = [
  { day: "Sun", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Mon", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Tue", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Wed", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Thu", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Fri", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Sat", Day: false, count: "", weekList: [...weekListTemplate] },
 
];

// export const updatedWeekDay:any = [
//     {day:"Mon",
//      Day:false,
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"Tue",
// Day:false,
// count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"We",
// Day:false,
//  count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"Thu",
// Day:false,
//  count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"Fr",
// Day:false,
//  count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"Sat",
// Day:false,
//  count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// },
// {day:"Sun",
// Day:false,
//  count:"",
// weekList:[{ name:'All', value: 'all', checked: false}, 
// { name:'Week 1', value: '1', checked: false},
//  { name:'Week 2', value: '2', checked: false}, 
//  { name:'Week 3', value: '3', checked: false}, 
//  { name:'Week 4', value: '4', checked: false},
//   { name: 'Week 5', value: '5', checked: false } ]
// }
// ]

export const updatedWeekDay:any= [
  { day: "Sun", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Mon", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Tue", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Wed", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Thu", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Fri", Day: false, count: "", weekList: [...weekListTemplate] },
  { day: "Sat", Day: false, count: "", weekList: [...weekListTemplate] },
 
];

