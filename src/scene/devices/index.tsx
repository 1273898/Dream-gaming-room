import { Pc } from './Pc'
import { Monitor } from './Monitor'
import { ConsoleStation } from './ConsoleStation'
import { Gamepad } from './Gamepad'

export function Devices() {
  return (
    <group>
      <Pc />
      <Monitor />
      <ConsoleStation />
      <Gamepad />
    </group>
  )
}
