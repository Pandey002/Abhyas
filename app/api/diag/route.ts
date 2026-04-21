import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  try {
    // Attempt to list models via the API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      keyMention: process.env.GEMINI_API_KEY?.substring(0, 10) + "..."
    }, { status: 500 });
  }
}
