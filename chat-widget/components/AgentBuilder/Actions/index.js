"use client";

import { useEffect, useState } from "react";
import ActionHeader from "./ActionHeader";
import ActionForm from "./ActionForm";
import ActionList from "./ActionList";
import {
  useGetAgentActionsQuery,
  useCreateAgentActionMutation,
  useUpdateAgentActionMutation,
  useDeleteAgentActionMutation,
} from "@/store/botApi";

const Actions = ({ currentAgentId }) => {
  const { data, isFetching } = useGetAgentActionsQuery(currentAgentId, {
    skip: !currentAgentId,
  });
  const [createAction] = useCreateAgentActionMutation();
  const [updateAction] = useUpdateAgentActionMutation();
  const [deleteAction] = useDeleteAgentActionMutation();

  const [actions, setActions] = useState([]);
  const [editingAction, setEditingAction] = useState(null);

  const [formData, setFormData] = useState({
    when: "",
    about: "",
    do: "",
    description: "",
  });

  useEffect(() => {
    if (data?.data) {
      setActions(data.data);
    }
  }, [data]);

  const handleSaveAction = async () => {
    if (!currentAgentId) return;
    const payload = {
      when: formData.when,
      about: formData.about,
      do: formData.do,
      description: formData.description,
      status: "active",
      params: {},
    };

    if (editingAction?._id) {
      await updateAction({
        agentId: currentAgentId,
        actionId: editingAction._id,
        ...payload,
      });
    } else {
      await createAction({ agentId: currentAgentId, ...payload });
    }

    setEditingAction(null);
    setFormData({ when: "", about: "", do: "", description: "" });
  };

  const handleCancel = () => {
    setEditingAction(null);
    setFormData({
      when: "",
      about: "",
      do: "",
      description: "",
    });
  };

  const handleEditAction = (action) => {
    setEditingAction(action);
    setFormData({
      when: action.when,
      about: action.about,
      do: action.do,
      description: action.description,
    });
  };

  const handleDeleteAction = async (id) => {
    if (!currentAgentId) return;
    await deleteAction({ agentId: currentAgentId, actionId: id });
  };

  const handleToggleAction = async (id) => {
    if (!currentAgentId) return;
    const found = actions.find((a) => (a._id || a.id) === id);
    if (!found) return;
    const newStatus = found.status === "active" ? "inactive" : "active";
    await updateAction({
      agentId: currentAgentId,
      actionId: found._id || id,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-divider pb-4">
        <h3 className="heading-lg">Actions</h3>
        <p className="text-sm text-secondary mt-1">
          Define automated responses and behaviors for your AI agent. Create
          rules that trigger specific actions based on user interactions.
        </p>
      </div>

      {/* Header */}
      <ActionHeader actionsLength={actions.length} />

      {/* Action Form - Always Visible */}
      <ActionForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveAction}
        onCancel={handleCancel}
        isEditing={!!editingAction}
      />

      {/* Actions List */}
      <ActionList
        actions={actions}
        onEdit={handleEditAction}
        onDelete={handleDeleteAction}
        onToggle={handleToggleAction}
      />
    </div>
  );
};

export default Actions;
