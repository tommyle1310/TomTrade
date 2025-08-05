import 'package:flutter/material.dart';

class FloatingTabBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final List<TabItem> items;

  const FloatingTabBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    // Add safety checks
    if (items.isEmpty || currentIndex < 0 || currentIndex >= items.length) {
      return const SizedBox.shrink();
    }

    final screenWidth = MediaQuery.of(context).size.width;
    final containerWidth = screenWidth - 40; // Total available width
    final tabWidth = containerWidth / items.length;
    
    // Calculate title position more safely
    final titleOffset = (currentIndex * tabWidth) + (tabWidth / 2) - 40;
    final safeOffset = titleOffset.clamp(0.0, containerWidth - 80);

    return Positioned(
      bottom: 12,
      left: 20,
      right: 20,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Title above active tab
          Container(
            margin: EdgeInsets.only(left: safeOffset, bottom: 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  offset: const Offset(0, 2),
                  blurRadius: 4,
                ),
              ],
            ),
            child: Text(
              items[currentIndex].label,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Color(0xFFFF6B6B),
              ),
              textAlign: TextAlign.center,
            ),
          ),
          // Tab bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
            child: Row(
              children: items.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final isActive = index == currentIndex;

                return Expanded(
                  child: GestureDetector(
                    onTap: () => onTap(index),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFFFF6B6B) : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            offset: const Offset(0, 4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Icon(
                        item.icon,
                        size: 24,
                        color: isActive ? Colors.white : const Color(0xFF8E8E93),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class TabItem {
  final IconData icon;
  final String label;

  const TabItem({
    required this.icon,
    required this.label,
  });
}