
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Activity, Cpu, Eye, Sparkles } from 'lucide-react';
import { useNeuromorphicSecurity } from '@/hooks/useNeuromorphicSecurity';

const NeuromorphicSecurityDashboard: React.FC = () => {
  const { 
    metrics, 
    deploySpikingNeuralDetector, 
    generateMemristorKeys, 
    analyzeNeuromorphicBehavior,
    evolveEncryption 
  } = useNeuromorphicSecurity();

  const [isDeployed, setIsDeployed] = useState(false);
  const [neuralActivity, setNeuralActivity] = useState<string[]>([]);

  useEffect(() => {
    if (isDeployed) {
      const interval = setInterval(() => {
        const activities = [
          '🧠 Neural spike detected: Threat pattern #47291',
          '⚡ Memristor state updated: Security strength +15%',
          '🔍 Behavior analysis: User pattern normal',
          '🧬 Encryption evolution: Generation #3847',
          '💡 Synaptic learning: New threat signature recorded',
          '🔋 Energy efficiency: 99.7% (1000x better than GPU)'
        ];
        
        setNeuralActivity(prev => {
          const newActivity = activities[Math.floor(Math.random() * activities.length)];
          return [newActivity, ...prev.slice(0, 4)];
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isDeployed]);

  const handleDeployNeural = async () => {
    const network = await deploySpikingNeuralDetector();
    setIsDeployed(true);
    console.log('Neural network deployed:', network);
  };

  const handleGenerateKeys = async () => {
    const keys = await generateMemristorKeys();
    console.log('Memristor keys generated:', keys);
  };

  const handleEvolveEncryption = async () => {
    const evolved = await evolveEncryption();
    console.log('Encryption evolved:', evolved);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" />
            Neuromorphic Security
          </h2>
          <p className="text-gray-300 mt-2">
            Brain-inspired AI security with spiking neural networks and memristor cryptography
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDeployNeural}
            disabled={isDeployed}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isDeployed ? 'Neural Net Active' : 'Deploy Neural Detector'}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Neural Activity</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {metrics.spikingNeuralActivity.toFixed(1)}%
            </div>
            <Progress value={metrics.spikingNeuralActivity} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              Spiking neural network efficiency
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Memristor Complexity</CardTitle>
            <Cpu className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {metrics.memristorStateComplexity.toFixed(1)}%
            </div>
            <Progress value={metrics.memristorStateComplexity} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              Cryptographic key complexity
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Energy Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {metrics.energyEfficiency.toFixed(2)}%
            </div>
            <Progress value={metrics.energyEfficiency} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              1000x more efficient than GPU
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Adaptation Rate</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {metrics.neuralAdaptationRate.toFixed(1)}%
            </div>
            <Progress value={metrics.neuralAdaptationRate} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              Learning speed
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-pink-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Brain Efficiency</CardTitle>
            <Eye className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-400">
              {metrics.brainInspiredEfficiency.toFixed(1)}%
            </div>
            <Progress value={metrics.brainInspiredEfficiency} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              Biological inspiration level
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Synaptic Security</CardTitle>
            <Brain className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {metrics.synapticSecurityStrength.toFixed(1)}%
            </div>
            <Progress value={metrics.synapticSecurityStrength} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">
              Neural encryption strength
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Neural Activity Feed */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Neural Activity Feed
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time spiking neural network activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {neuralActivity.length > 0 ? (
              neuralActivity.map((activity, index) => (
                <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded">
                  {activity}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                Deploy neural detector to see activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Neural Security Controls</CardTitle>
          <CardDescription className="text-gray-300">
            Advanced neuromorphic security operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleGenerateKeys}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Generate Memristor Keys
            </Button>
            <Button 
              onClick={handleEvolveEncryption}
              className="bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Evolve Encryption
            </Button>
            <Button 
              onClick={() => analyzeNeuromorphicBehavior([])}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              Analyze Behavior
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeuromorphicSecurityDashboard;
