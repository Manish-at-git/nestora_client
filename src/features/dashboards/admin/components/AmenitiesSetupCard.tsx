import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/services/api/apiClient";
import { Amenity } from "../types";

export interface AmenitiesSetupCardProps {
  associationId: string | number;
  currencySymbol: string;
}

export const AmenitiesSetupCard: React.FC<AmenitiesSetupCardProps> = ({
  associationId,
  currencySymbol,
}) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState({ name: "", charges: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (associationId && String(associationId) !== "ALL") {
      fetchAmenities();
    }
  }, [associationId]);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/associations/${associationId}/amenities`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAmenities(list);
    } catch (err) {
      console.error("Failed to load amenities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async () => {
    if (!newAmenity.name.trim()) {
      toast.error("Please enter an amenity name.");
      return;
    }

    try {
      setIsAdding(true);
      await apiClient.post(`/admin/associations/${associationId}/amenities`, {
        name: newAmenity.name.trim(),
        charges: newAmenity.charges,
        status: true,
      });
      toast.success("Amenity added successfully.");
      setNewAmenity({ name: "", charges: 0 });
      fetchAmenities();
    } catch (err) {
      console.error("Error adding amenity:", err);
      toast.error("Failed to add amenity.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleAmenity = async (amenityId: string | number, currentStatus: boolean | number) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setAmenities((prev) =>
      prev.map((item) =>
        item.id === amenityId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      await apiClient.put(
        `/admin/associations/${associationId}/amenities/${amenityId}`,
        { status: nextStatus }
      );
      toast.success("Amenity status updated.");
    } catch (err) {
      console.error("Error updating amenity status:", err);
      toast.error("Failed to update amenity status.");
      // Rollback
      fetchAmenities();
    }
  };

  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
          Amenities Setup
        </h3>

        {/* Inline Add Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amenity Name
            </label>
            <Input
              type="text"
              value={newAmenity.name}
              onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
              placeholder="e.g. Clubhouse, Tennis Court"
              className="w-full h-10 border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="w-full md:w-36">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Charges ({currencySymbol})
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newAmenity.charges}
              onChange={(e) =>
                setNewAmenity({
                  ...newAmenity,
                  charges: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full h-10 border-slate-200 rounded-xl text-sm"
            />
          </div>

          <Button
            type="button"
            onClick={handleAddAmenity}
            disabled={isAdding}
            className="h-10 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium cursor-pointer disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </div>

        {/* Amenities Table */}
        {loading && amenities.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-sm">
            Loading amenities...
          </div>
        ) : amenities.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-medium">
                <tr>
                  <th className="px-5 py-3.5">Amenity Name</th>
                  <th className="px-5 py-3.5">Charges</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {amenities.map((item) => {
                  const isChecked = Boolean(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {currencySymbol}
                        {parseFloat(String(item.charges || 0)).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end">
                          <Switch
                            checked={isChecked}
                            onCheckedChange={() => handleToggleAmenity(item.id, item.status)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-2">No amenities defined.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AmenitiesSetupCard;
