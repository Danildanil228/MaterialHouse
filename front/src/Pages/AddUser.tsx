import { Button } from "@/components/ui/button";

import {Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue,} from "@/components/ui/select"

export default function AddUser(){
    return(
        <section className="text-xl grid gap-4">
            <h1 className="text-2xl">Добавить нового пользователя</h1>
            <div className="flex flex-wrap justify-between">
                <div className="">
                    <p>Введите имя</p>
                    <input 
                        type="text" 
                        placeholder="Имя" 
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1 text-xl"
                    />
                </div>
                <div className="">
                    <p className="">Введите фамилию</p>
                    <input 
                        type="text" 
                        placeholder="Фамилия" 
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-1 text-xl"
                    />
                </div>
            </div>
            
            <div className="grid gap-2">
                <p>Выберете роль</p>
                <Select>
                    <SelectTrigger className="">
                        <SelectValue placeholder="Роль" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Администратор</SelectItem>
                        <SelectItem value="accountant">Бехгалтер</SelectItem>
                        <SelectItem value="storekeeper">Кладовщик</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button className="w-fit">Создать</Button>
        </section>
    )
}