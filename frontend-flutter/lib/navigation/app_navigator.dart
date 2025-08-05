import 'package:flutter/material.dart';
import '../screens/home_screen.dart';
import '../screens/like_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/search_screen.dart';
import '../widgets/floating_tab_bar.dart';

class AppNavigator extends StatefulWidget {
  const AppNavigator({super.key});

  @override
  State<AppNavigator> createState() => _AppNavigatorState();
}

class _AppNavigatorState extends State<AppNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    LikeScreen(),
    SettingsScreen(),
    SearchScreen(),
  ];

  final List<TabItem> _tabItems = const [
    TabItem(icon: Icons.home, label: 'Home'),
    TabItem(icon: Icons.favorite, label: 'Like'),
    TabItem(icon: Icons.settings, label: 'Settings'),
    TabItem(icon: Icons.search, label: 'Search'),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Stack(
        children: [
          // Screen content
          IndexedStack(
            index: _currentIndex.clamp(0, _screens.length - 1),
            children: _screens,
          ),
          // Floating tab bar
          FloatingTabBar(
            currentIndex: _currentIndex,
            onTap: _onTabTapped,
            items: _tabItems,
          ),
        ],
      ),
    );
  }
}