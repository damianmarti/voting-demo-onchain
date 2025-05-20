"use client";

import { useEffect, useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "../hooks/scaffold-eth";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";

const TEAM_LABELS = ["Millonarios", "Independiente Medellin", "Atlético Nacional", "Otros"];

export default function VotingPage() {
  const [pendingVote, setPendingVote] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const { address } = useAccount();

  const { data: votes, refetch } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "getAllVotes",
  });

  // Check if the user has already voted
  const {
    data: voted,
    refetch: refetchHasVoted,
    isLoading: isLoadingHasVoted,
  } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "hasVoted",
    args: [address],
  });

  useEffect(() => {
    if (typeof voted === "boolean") {
      setHasVoted(voted);
    }
  }, [voted]);

  const { writeContractAsync: voteAsync } = useScaffoldWriteContract({ contractName: "Voting" });

  const handleVote = async (teamIdx: number) => {
    setPendingVote(teamIdx);
    try {
      await voteAsync({ functionName: "vote", args: [teamIdx] });
      await refetch();
      await refetchHasVoted();
      toast.success("¡Voto registrado!");
    } catch (e: any) {
      if (e?.shortMessage?.includes("Already voted") || e?.message?.includes("Already voted")) {
        toast.error("Ya has votado con esta dirección.");
        setHasVoted(true);
      } else {
        toast.error("Error al votar. Intenta de nuevo.");
      }
    } finally {
      setPendingVote(null);
    }
  };

  // If no address, prompt to connect wallet
  if (!address) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center relative bg-base-200">
        <div className="bg-base-100 p-8 rounded-xl shadow-lg w-full max-w-md mt-16 text-center">
          <h1 className="text-2xl font-bold mb-4">¿Cuál es tu equipo de futbol Colombiano favorito?</h1>
          <p className="mb-4">Conecta tu wallet para votar.</p>
        </div>
        {/* QR code bottom left */}
        <div className="fixed bottom-4 left-4 bg-base-100 p-2 rounded-xl shadow-lg flex flex-col items-center">
          <QRCodeSVG
            value={typeof window !== "undefined" ? window.location.href : "https://localhost:3000/voting"}
            size={96}
          />
          <span className="text-xs mt-2">Escanea para votar</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center relative bg-base-200">
      <div className="bg-base-100 p-8 rounded-xl shadow-lg w-full max-w-md mt-16">
        <h1 className="text-2xl font-bold mb-4 text-center">¿Cuál es tu equipo de futbol Colombiano favorito?</h1>
        <div className="space-y-4">
          {TEAM_LABELS.map((label, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <span className="font-medium">{label}</span>
              <span className="badge badge-primary badge-lg">{votes ? votes[idx].toString() : "-"}</span>
              <button
                className="btn btn-accent btn-sm"
                disabled={pendingVote !== null || hasVoted || isLoadingHasVoted}
                onClick={() => handleVote(idx)}
              >
                {isLoadingHasVoted
                  ? "Cargando..."
                  : hasVoted
                    ? "Ya votaste"
                    : pendingVote === idx
                      ? "Votando..."
                      : "Votar"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* QR code bottom left */}
      <div className="fixed bottom-4 left-4 bg-base-100 p-2 rounded-xl shadow-lg flex flex-col items-center">
        <QRCodeSVG
          value={typeof window !== "undefined" ? window.location.href : "https://localhost:3000/voting"}
          size={96}
        />
        <span className="text-xs mt-2">Escanea para votar</span>
      </div>
    </div>
  );
}
