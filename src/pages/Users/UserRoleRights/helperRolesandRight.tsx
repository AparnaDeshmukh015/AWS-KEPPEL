export const convertApiResponse = (response: any) => {
  let sanitized = response.map((parent: any, parentIndex: any) => {
   
    return {
      key: parentIndex,
      data: {
        name: parent.MODULE_DESCRIPTION,
        noAccess: parent.DETAIL.some((detail:any) => detail.NO_ACCESS === "True"),
        view: parent.DETAIL.some((detail:any) => detail.VIEW_RIGHTS === "True"),
        add: parent.DETAIL.some((detail:any) => detail.ADD_RIGHTS === "True"),
        update:  parent.DETAIL.some((detail:any) => detail.UPDATE_RIGHTS === "True"),
        delete: parent.DETAIL.some((detail:any) => detail.DELETE_RIGHTS === "True"),
      },
      children: parent.DETAIL.map((child: any, childIndex: any) => {
        return {
          key: `${parentIndex}-${childIndex}`,
          data: {
            name: child.FUNCTION_DESC,
            noAccess: child?.NO_ACCESS === "True",
            view: child?.VIEW_RIGHTS === "True",
            add: child?.ADD_RIGHTS === "True",
            update: child?.UPDATE_RIGHTS === "True",
            delete: child?.DELETE_RIGHTS === "True",
            functionCode: child?.FUNCTION_CODE
          }
        };
      })
    };
  });
 
  return sanitized;
}

export const getChildrenValues = (parentData: any, isChecked: any, keyName: any, key: any) => {
  return parentData.children.map((elem: any) => {


    if (elem.key === key) {
      let data = {};
      if (isChecked) {

        if (keyName === "noAccess") {
          data = {
            ...elem.data,
            noAccess: true,
            view: false,
            add: false,
            update: false,
            delete: false
          }
        }
        else if (keyName === "view") {
          if (isChecked === true) {
            data = {
              ...elem.data,
              noAccess: false,
              view: true,

            }
          }
        }
        else if (keyName === "add") {

          data = {
            ...elem.data,
            noAccess: false,
            add: true,
            view: true,
            //  update:false,
            //  delete:false
          }
        } else if (keyName === "update") {
          data = {
            ...elem.data,
            noAccess: false,
            update: true,
            view: true,
            //  add:false,
            //  delete:false
          }
        } else if (keyName === "delete") {
          data = {
            ...elem.data,
            noAccess: false,
            delete: true,
            view: true,
            //  add:false,
            //  update:false

          }
        }
      } else if (isChecked === false) {

        if (keyName === 'noAccess') {

          data = {
            ...elem.data,
            noAccess: false,
            view: true,
            add: false,
            delete: false,
            update: false

          }
        }
        if (keyName === "view") {

          data = {
            ...elem.data,
            noAccess: true,
            view: false,
            add: false,
            delete: false,
            update: false

          }
        } if (keyName === "add") {
          data = {
            ...elem.data,
            noAccess: false,
            // view: false,
            add: false,
            // delete:true,
            // update:true

          }
        } if (keyName === "update") {
          data = {
            ...elem.data,
            noAccess: false,
            view: true,


            update: false

          }
        } if (keyName === "delete") {
          data = {
            ...elem.data,
            noAccess: false,
            view: true,
            // add:true,
            delete: false,


          }
        }
      }

      else {
        data = {
          ...elem.data,
          [keyName]: !elem.data[keyName]
        }
      }
      return {
        key,
        data
      }
    }
    return elem;
  })
}

// export const getChildrenValues = (parentData:any, isChecked:any, keyName:any, key:any) => {
//
//   return parentData.children.map((elem:any) => {
//       if (elem.key !== key) {
//
//           return elem;
//       }

//       let data = { ...elem.data };
//       if (isChecked) {
//           if (keyName === "noAccess") {
//               data = {
//                   ...data,
//                   noAccess: true,
//                   view: false,
//                   add: false,
//                   update: false,
//                   delete: false
//               };
//           } else {
//               data = {
//                   ...data,
//                   noAccess: false,
//                   [keyName]: true
//               };
//           }
//       } else {
//           if (keyName === "noAccess") {
//               data = {
//                   ...data,
//                   noAccess: false,
//                   view: true,
//                   add: false,
//                   update: false,
//                   delete: false
//               };
//           } else {
//               data = {
//                   ...data,
//                   noAccess: true,
//                   [keyName]: false
//               };
//           }
//       }
//       return {
//           key,
//           data
//       };
//   });
// };
