import React from 'react';

const Assignee = ()=>{
    const assigneeData:any=[
        {name:"Juraime Bin Mohamed Jailan",
            teamName:"KSTP EMU Team"
        },
        {name:"Juraime Bin Mohamed Jailan",
            teamName:"KSTP EMU Team"
        },
        {name:"Juraime Bin Mohamed Jailan",
            teamName:"KSTP EMU Team"
        }
      ]
    return (
        <> <div className="ScrollViewAssigneeTab">
                      {assigneeData?.map((tech: any, index: any) => {
                         return (
                            <div className="flex justify-start" key={index}>
                             
                              <div>
                                <p className="Text_Primary Input_Text">
                                  {tech?.name}
                                </p>
                                <label className=" Text_Secondary Helper_Text">
                                  {tech?.teamName}
                                </label>
                              </div>
                            </div>
                          );
                        })}
        </div>
      </>

    )
}
export default Assignee;