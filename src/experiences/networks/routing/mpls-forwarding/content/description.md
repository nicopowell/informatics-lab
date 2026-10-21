# MPLS label switching

An MPLS router does not read the destination on every hop. The path is decided
**once**, at the ingress router: the packet is classified into a Forwarding
Equivalence Class, given a label, and from then on each router reads only that
label and its own forwarding table.

- **Push, swap, pop:** the ingress LER pushes the first label; each LSR swaps it
  for the next one; the egress LER pops it and hands the packet to the destination
- **The LFIB:** every row reads "input port, input label to output port, output
  label" — ports are plain numbers (0, 1, 2 …) shared with the diagram — and a
  label carries no meaning outside the single node reading it
- **Terminals:** PC-A and PC-B sit outside the tunnel, plugged into numbered
  ports of the two LERs. The run opens with PC-A handing the packet to its
  gateway and closes with PC-B taking delivery after the pop — labels only
  exist between the LERs
- **The LSP:** the chain of rows forms a Label Switched Path, a tunnel laid over
  the physical topology — drawn here as the highlighted route while the grey
  links stay untouched

The topology shows the physical links the packet never uses. A shorter path
exists through LSR-2 and the packet will not take it: MPLS forwards along the
configured tunnel, not along the shortest route. Real networks exploit that to
send traffic where the IP route would not go.

What you see here is the **data plane** only. The control plane that builds the
tables in the first place (IGP routing, RSVP-TE signalling) is out of scope, so
nothing recalculates after your edits.

**Try this:** step forward until LSR-1 lights its row, change its output label
from 17 to any other number, press play again, and watch the packet reach LSR-3
with a label no row claims. The error frame names the exact port and label that
found nothing, and the packet stops there. Edit the label back, or press
"Restore LFIB", to rebuild the chain.
