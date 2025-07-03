import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wrench,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { databaseUtils } from "@/utils/databaseTroubleshoot";
import { cn } from "@/lib/utils";

interface EnhancedAuthFormProps {
  onClose?: () => void;
}

const EnhancedAuthForm: React.FC<EnhancedAuthFormProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginType, setLoginType] = useState<"email" | "username">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [dbHealth, setDbHealth] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    signIn,
    signInWithUsername,
    signUp,
    signUpWithUsername,
    checkUsernameAvailability,
    checkEmailAvailability,
  } = useAuth();

  // Check database health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await databaseUtils.healthCheck();
      setDbHealth(health);
    };

    checkHealth();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (mode === "register") {
      // Email validation
      if (!formData.email) {
        newErrors.email = "Email jest wymagany";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Nieprawidłowy format email";
      } else {
        const emailAvailable = await checkEmailAvailability(formData.email);
        if (!emailAvailable) {
          newErrors.email = "Ten email jest już zajęty";
        }
      }

      // Username validation
      if (!formData.username) {
        newErrors.username = "Nazwa użytkownika jest wymagana";
      } else if (formData.username.length < 3) {
        newErrors.username = "Nazwa użytkownika musi mieć co najmniej 3 znaki";
      } else {
        const usernameAvailable = await checkUsernameAvailability(
          formData.username,
        );
        if (!usernameAvailable) {
          newErrors.username = "Ta nazwa użytkownika jest już zajęta";
        }
      }

      // Password confirmation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Hasła nie są identyczne";
      }
    } else {
      // Login validation
      if (loginType === "email" && !formData.email) {
        newErrors.email = "Email jest wymagany";
      } else if (loginType === "username" && !formData.username) {
        newErrors.username = "Nazwa użytkownika jest wymagana";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane";
    } else if (mode === "register" && formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const isValid = await validateForm();
      if (!isValid) return;

      if (mode === "login") {
        if (loginType === "email") {
          await signIn(formData.email, formData.password);
        } else {
          await signInWithUsername(formData.username, formData.password);
        }
      } else {
        if (loginType === "email") {
          await signUp(formData.email, formData.password, formData.username);
        } else {
          await signUpWithUsername(
            formData.username,
            formData.password,
            formData.displayName,
          );
        }
      }

      onClose?.();
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrors({
        general: error.message || "Wystąpił błąd podczas autoryzacji",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatabaseRepair = async () => {
    setIsRepairing(true);

    try {
      const repaired = await databaseUtils.emergencyRepair();
      if (repaired) {
        const newHealth = await databaseUtils.healthCheck();
        setDbHealth(newHealth);
      }
    } catch (error) {
      console.error("Repair error:", error);
    } finally {
      setIsRepairing(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md bg-gray-900/95 border-white/10 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-6">
          {/* Database Health Status */}
          {dbHealth && !dbHealth.overall && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Problemy z bazą danych.
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDatabaseRepair}
                    disabled={isRepairing}
                    className="text-red-400 hover:text-red-300 p-0 ml-1 h-auto"
                  >
                    {isRepairing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Naprawiam...
                      </>
                    ) : (
                      <>
                        <Wrench className="w-3 h-3 mr-1" />
                        Napraw teraz
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === "login" ? "Witaj z powrotem!" : "Dołącz do nas!"}
              </h2>
              <p className="text-gray-400">
                {mode === "login"
                  ? "Zaloguj się do swojego konta"
                  : "Utwórz nowe konto SecureChat"}
              </p>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as any)}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                  <TabsTrigger
                    value="login"
                    className="text-gray-300 data-[state=active]:text-white"
                  >
                    Logowanie
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="text-gray-300 data-[state=active]:text-white"
                  >
                    Rejestracja
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Login Type Toggle */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                <Button
                  type="button"
                  variant={loginType === "email" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("email")}
                  className="flex-1 text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant={loginType === "username" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLoginType("username")}
                  className="flex-1 text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Username
                </Button>
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "register" && loginType === "email" && (
                  <motion.div
                    key="email-register"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="twoj@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </motion.div>
                )}

                {mode === "login" && loginType === "email" && (
                  <motion.div
                    key="email-login"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="twoj@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </motion.div>
                )}

                {(loginType === "username" || mode === "register") && (
                  <motion.div
                    key="username"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Label htmlFor="username" className="text-gray-300">
                      Nazwa użytkownika
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="nazwa_uzytkownika"
                    />
                    {errors.username && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.username}
                      </p>
                    )}
                  </motion.div>
                )}

                {mode === "register" && loginType === "username" && (
                  <motion.div
                    key="display-name"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Label htmlFor="displayName" className="text-gray-300">
                      Wyświetlana nazwa (opcjonalna)
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      className="bg-gray-800/50 border-gray-600 text-white"
                      placeholder="Twoja nazwa"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <Label htmlFor="password" className="text-gray-300">
                  Hasło
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="bg-gray-800/50 border-gray-600 text-white pr-10"
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </motion.div>

              {mode === "register" && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <Label htmlFor="confirmPassword" className="text-gray-300">
                    Potwierdź hasło
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="bg-gray-800/50 border-gray-600 text-white pr-10"
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              )}

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert className="bg-red-500/10 border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      {errors.general}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {mode === "login" ? "Logowanie..." : "Rejestracja..."}
                    </>
                  ) : (
                    <>
                      {mode === "login" ? (
                        <Lock className="w-4 h-4 mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {mode === "login" ? "Zaloguj się" : "Utwórz konto"}
                    </>
                  )}
                </Button>

                {onClose && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Anuluj
                  </Button>
                )}
              </motion.div>
            </form>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAuthForm;
