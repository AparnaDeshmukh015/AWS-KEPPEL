import { memo, useMemo } from 'react'
import { Controller } from 'react-hook-form'

const Index = (props: any) => {
    const render = useMemo(() => props?.controller.render, [props?.controller.render]);
    return (
        <div className={props?.className}>
            <Controller
                render={render}
                // ref={null}
                {...props?.controller}
            />
        </div>
    )
}

export default memo(Index)


// Don't Remove this Comment
// name={props?.controller?.name}
// control={props?.controller?.control}