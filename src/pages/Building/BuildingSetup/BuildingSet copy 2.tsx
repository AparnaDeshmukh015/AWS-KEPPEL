import React, { useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useOutletContext } from 'react-router-dom';

const BuildingSet = () => {
  const [selected, menuList]: any = useOutletContext();
  const menuRef: any = useRef(null);
  const menuRef1: any = useRef(null);
  const LevelActionList = [
    {
      label: 'Create', icon: 'pi pi-plus',
      command: (check: any) => {

      }
    },
    { label: 'Edit', icon: 'pi pi-file-edit' },
    { label: 'Delete', icon: 'pi pi-trash' }
  ];

  const openMenu = (e: any, ref: any) => {

    ref?.current?.toggle(e);
  };

  return (
    <Card className='facility-card mt-2 h-100'>
      <div className="grid grid-cols-1 md:grid-cols-8">
        <div className="col-span-7">
          <div className=''>
            {/* Menu component with conditional ref */}
            <Menu model={LevelActionList} popup ref={menuRef} />
            <div className='flex'>
              <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300`}></span>
              {/* Button 1 */}
              <Button className='text-black' onClick={(e) => openMenu(e, menuRef)}>LEVEL1?.node_name</Button>
            </div>
            <div className='flex mt-[300px]'>
              <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300`}></span>
              {/* Button 2 */}
              <Button className='text-black' onClick={(e) => openMenu(e, menuRef1)}>LEVEL2?.node_name</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BuildingSet;
