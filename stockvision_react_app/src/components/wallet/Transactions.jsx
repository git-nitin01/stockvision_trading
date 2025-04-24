import { useWallet } from "@/context/walletProvider";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

const Transactions = () => {
  const { transactions } = useWallet();

  return (
    <Table>
      <TableHeader>
        <TableRow style={{ backgroundColor: "rgba(0, 0, 0, 0.1)"}}>
          <TableCell>Amount</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transact) => (
          <TableRow key={transact.id} style={{
            backgroundColor: transact.amount > 0 ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)"
          }}>
            <TableCell>
              ${transact.amount.toFixed(2)}
            </TableCell>
            <TableCell>{transact.type}</TableCell>
            <TableCell>{new Date(transact.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Transactions;
