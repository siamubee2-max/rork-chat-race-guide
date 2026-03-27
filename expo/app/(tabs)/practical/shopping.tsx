import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Plus,
  Check,
  Trash2,
  ShoppingBag,
  Box,
  Gamepad2,
  Scissors,
  Pill,
  CircleDot,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useShopping, type ShoppingItem, type ShoppingCategory } from "@/context/shopping";

const CATEGORY_INFO: Record<ShoppingCategory, { icon: typeof ShoppingBag; color: string; label: string }> = {
  food: { icon: ShoppingBag, color: "#4CAF50", label: "Nourriture" },
  litter: { icon: Box, color: "#795548", label: "Litière" },
  toys: { icon: Gamepad2, color: "#FF5722", label: "Jouets" },
  accessories: { icon: Box, color: "#FF9800", label: "Accessoires" },
  grooming: { icon: Scissors, color: "#E91E63", label: "Toilettage" },
  medication: { icon: Pill, color: "#2196F3", label: "Médicaments" },
  other: { icon: CircleDot, color: Colors.textMuted, label: "Autre" },
};

const PRIORITIES = {
  high: { label: "Urgent", color: Colors.error },
  medium: { label: "Normal", color: Colors.warning },
  low: { label: "Pas urgent", color: Colors.info },
};

type ShoppingItemCardProps = {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
};

const ShoppingItemCard = ({ item, onToggle, onDelete }: ShoppingItemCardProps) => {
  const categoryInfo = CATEGORY_INFO[item.category];
  const priorityInfo = PRIORITIES[item.priority];

  return (
    <View style={[styles.itemCard, item.checked && styles.itemCardChecked]}>
      <Pressable
        style={({ pressed }) => [
          styles.checkButton,
          item.checked && styles.checkButtonChecked,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onToggle}
      >
        {item.checked && <Check size={14} color="#fff" />}
      </Pressable>

      <View style={[styles.categoryDot, { backgroundColor: categoryInfo.color }]} />

      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.name}
        </Text>
        {item.quantity && (
          <Text style={styles.itemQuantity}>Qté: {item.quantity}</Text>
        )}
      </View>

      {!item.checked && item.priority !== "medium" && (
        <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color + "20" }]}>
          <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
            {priorityInfo.label}
          </Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
        onPress={onDelete}
      >
        <Trash2 size={16} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
};

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const { uncheckedItems, checkedItems, addItem, toggleCheck, deleteItem, clearChecked } = useShopping();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showChecked, setShowChecked] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ShoppingCategory>("food");
  const [newItemPriority, setNewItemPriority] = useState<"low" | "medium" | "high">("medium");
  const [newItemQuantity, setNewItemQuantity] = useState("");

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom");
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      category: newItemCategory,
      name: newItemName.trim(),
      quantity: newItemQuantity ? parseInt(newItemQuantity) : undefined,
      checked: false,
      priority: newItemPriority,
      createdAt: new Date().toISOString(),
    };

    await addItem(newItem);
    setNewItemName("");
    setNewItemQuantity("");
    setShowAddForm(false);
  };

  const handleDelete = (item: ShoppingItem) => {
    Alert.alert(
      "Supprimer",
      `Supprimer "${item.name}" de la liste ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => deleteItem(item.id) },
      ]
    );
  };

  const handleClearChecked = () => {
    Alert.alert(
      "Vider les articles cochés",
      "Supprimer tous les articles cochés ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Vider", style: "destructive", onPress: () => clearChecked() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.9 }]}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter un article</Text>
        </Pressable>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Nom de l'article..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />

            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                placeholder="Qté"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
              />
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const IconComponent = info.icon;
                  const isSelected = newItemCategory === key;
                  return (
                    <Pressable
                      key={key}
                      style={[styles.categoryChip, isSelected && { backgroundColor: info.color + "20", borderColor: info.color }]}
                      onPress={() => setNewItemCategory(key as ShoppingCategory)}
                    >
                      <IconComponent size={14} color={isSelected ? info.color : Colors.textMuted} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.priorityRow}>
              {Object.entries(PRIORITIES).map(([key, info]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.priorityChip,
                    newItemPriority === key && { backgroundColor: info.color + "20", borderColor: info.color },
                  ]}
                  onPress={() => setNewItemPriority(key as "low" | "medium" | "high")}
                >
                  <Text style={[styles.priorityChipText, newItemPriority === key && { color: info.color }]}>
                    {info.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.9 }]}
              onPress={handleAddItem}
            >
              <Check size={18} color="#fff" />
              <Text style={styles.confirmButtonText}>Ajouter</Text>
            </Pressable>
          </View>
        )}

        {uncheckedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À acheter ({uncheckedItems.length})</Text>
            {uncheckedItems.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={() => toggleCheck(item.id)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </View>
        )}

        {checkedItems.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setShowChecked(!showChecked)}
            >
              <Text style={styles.sectionTitle}>Acheté ({checkedItems.length})</Text>
              <View style={styles.sectionActions}>
                {showChecked && (
                  <Pressable style={styles.clearButton} onPress={handleClearChecked}>
                    <Text style={styles.clearButtonText}>Vider</Text>
                  </Pressable>
                )}
                {showChecked ? <ChevronUp size={20} color={Colors.textMuted} /> : <ChevronDown size={20} color={Colors.textMuted} />}
              </View>
            </Pressable>
            {showChecked &&
              checkedItems.map((item) => (
                <ShoppingItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleCheck(item.id)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
          </View>
        )}

        {uncheckedItems.length === 0 && checkedItems.length === 0 && !showAddForm && (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Liste vide</Text>
            <Text style={styles.emptyText}>
              Ajoutez des articles pour ne rien oublier lors de vos courses
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  addForm: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  quantityInput: {
    width: 60,
    textAlign: "center",
  },
  categoriesScroll: {
    flex: 1,
  },
  categoryChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.success,
    borderRadius: 10,
    padding: 12,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.error,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  itemCardChecked: {
    opacity: 0.6,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkButtonChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  itemQuantity: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
