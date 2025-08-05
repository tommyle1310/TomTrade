import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'navigation/app_navigator.dart';

void main() {
  runApp(const TomTradeApp());
}

class TomTradeApp extends StatelessWidget {
  const TomTradeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TomTrade',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFFF6B6B)),
        useMaterial3: true,
      ),
      home: const AppNavigator(),
      debugShowCheckedModeBanner: false,
    );
  }
}