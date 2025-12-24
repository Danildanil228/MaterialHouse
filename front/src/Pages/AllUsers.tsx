import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { io } from 'socket.io-client';

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  useEffect(() => {
  fetchUsers();
  
  // Подключаемся к сокету для отслеживания удаления пользователя
  const socket = io(API_BASE_URL);
  
  socket.on('user_deleted', (data: any) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Если текущего пользователя удалили, выходим из системы
    if (currentUser.id === data.userId) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  });
  
  return () => {
    socket.disconnect();
  };
}, []);

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Имя пользователя
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("username")}</div>,
    },
    {
      accessorKey: "password",
      header: "Пароль",
      cell: ({ row }) => <div>{row.getValue("password")}</div>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Роль
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
            <>
            
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <img src="/trash.png" className="w-5 icon-theme-aware cursor-pointer" alt="" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить пользователя</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
            </>
          
          
        );
      },
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
  // Получаем текущего пользователя
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Проверяем, не пытается ли пользователь удалить самого себя
  if (currentUser.id === id) {
    alert("Вы не можете удалить свой собственный аккаунт!");
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
    setUsers(users.filter(user => user.id !== id));
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    alert("Не удалось удалить пользователя");
  }
};

  const handleDeleteSelected = async () => {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(row => row.original.id);
  
  // Получаем текущего пользователя
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Проверяем, не пытается ли пользователь удалить самого себя
  if (selectedIds.includes(currentUser.id)) {
    alert("Вы не можете удалить свой собственный аккаунт!");
    return;
  }

  if (selectedIds.length === 0) {
    alert("Выберите пользователей для удаления");
    return;
  }


  try {
    for (const id of selectedIds) {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
    }
    
    setUsers(users.filter(user => !selectedIds.includes(user.id)));
    setRowSelection({});
  } catch (error) {
    console.error("Ошибка удаления пользователей:", error);
    alert("Не удалось удалить пользователей");
  }
};

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return <div className="p-4">Загрузка пользователей...</div>;
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <section className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Все пользователи</h1>
      
      <div className="w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
          <Input
            placeholder="Поиск по username..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("username")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          
          {selectedCount > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Выбрано: {selectedCount}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button variant="destructive" >Удалить выбранных пользователей</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>Удалить</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
          )}
          
          <div className="ml-auto">
            <Button
              variant="outline"
              onClick={fetchUsers}
              className="ml-2"
            >
              Обновить
            </Button>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Нет пользователей.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-4">
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} пользователей
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Назад
            </Button>
            <span className="text-sm">
              Страница {table.getState().pagination.pageIndex + 1} из{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Вперед
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}